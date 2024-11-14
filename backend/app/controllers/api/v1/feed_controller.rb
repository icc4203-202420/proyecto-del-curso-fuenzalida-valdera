class API::V1::FeedController < ApplicationController
  before_action :set_current_user, only: [:index, :friends]

  def index
    friend_ids = get_friend_ids(params[:friend_id])

    # Si hay un `friend_id` presente, se debe excluir al usuario actual
    if params[:friend_id].present?
      # Solo mostrar contenido relacionado con el amigo especificado, excluyendo al usuario actual
      event_pictures = EventPicture.includes(:event, :user)
                                   .where(user_id: friend_ids)
                                   .order(created_at: :desc)

      reviews = Review.includes(:user, :beer)
                      .where(user_id: friend_ids)
                      .order(created_at: :desc)
    else
      # Si no hay `friend_id`, mostrar eventos y reseñas tanto del usuario como de sus amigos
      event_pictures = EventPicture.includes(:event, :user)
                                   .where(user_id: [@current_user.id, *friend_ids])
                                   .order(created_at: :desc)

      reviews = Review.includes(:user, :beer)
                      .where(user_id: [@current_user.id, *friend_ids])
                      .order(created_at: :desc)
    end

    # Aplicar filtros adicionales a las `event_pictures` y `reviews`
    event_pictures = filter_event_pictures(event_pictures)

    if params[:beer_id].present?
      reviews = reviews.where(beer_id: params[:beer_id])
    end

    # Construir el feed
    feed = build_feed(event_pictures, reviews)

    # Ordenar el feed por fecha
    feed.sort_by! { |post| post[:created_at] }.reverse!

    render json: feed
  end

  def friends
    friends = @current_user.friends.select(:id, :handle) # O cualquier campo necesario
    render json: friends
  end

  private

  # Setea el usuario actual
  def set_current_user
    user_id = params[:user_id]
    if user_id.nil?
      render json: { error: 'User ID is missing' }, status: :unauthorized and return
    end

    @current_user = User.find_by(id: user_id)
    unless @current_user
      render json: { error: 'Invalid user ID' }, status: :unauthorized and return
    end
  end

  # Obtiene los IDs de los amigos (y opcionalmente filtra por friend_id)
  def get_friend_ids(friend_id = nil)
    friend_ids = @current_user.friends.pluck(:id)
    if friend_id.present?
      friend_ids.select { |id| id == friend_id.to_i }
    else
      friend_ids
    end
  end

  # Filtra event_pictures con los parámetros de bar_id y country
  def filter_event_pictures(event_pictures)
    event_pictures = event_pictures.where(events: { bar_id: params[:bar_id] }) if params[:bar_id].present?
    event_pictures = event_pictures.where(events: { country: params[:country] }) if params[:country].present?
    event_pictures
  end

  # Construye el feed con las publicaciones de event_pictures y reviews
  def build_feed(event_pictures, reviews)
    feed = event_pictures.map do |event_picture|
      {
        type: 'event_picture',
        image_url: url_for(event_picture.image),
        description: event_picture.description,
        created_at: event_picture.created_at.iso8601,
        event_name: event_picture.event.name,
        user_name: event_picture.user.handle,
        bar_id: event_picture.event.bar_id,
        event_id: event_picture.event_id
      }
    end

    reviews.each do |review|
      feed.push({
        type: 'beer_review',
        beer_name: review.beer.name,
        rating: review.rating,
        review_text: review.text,
        created_at: review.created_at.iso8601,
        user_name: review.user.handle,
        beer_id: review.beer.id
      })
    end

    feed
  end
end
