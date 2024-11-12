class API::V1::FeedController < ApplicationController
  def index
    event_pictures = EventPicture.includes(:event, :user).order(created_at: :desc)

    reviews = Review.includes(:user, :beer).order(created_at: :desc)

    feed = event_pictures.map do |event_picture|
      {
        type: 'event_picture',
        image_url: url_for(event_picture.image),  # URL de la imagen almacenada en ActiveStorage
        description: event_picture.description,   # Descripción de la imagen
        created_at: event_picture.created_at.iso8601,    # Fecha de creación
        event_name: event_picture.event.name,    # Nombre del evento (supuesto que el evento tiene un nombre)
        user_name: event_picture.user.handle       # Nombre del usuario (supuesto que el usuario tiene un nombre)
      }
    end

    reviews.each do |review|
      feed.push({
        type: 'beer_review',  # Para identificar que es una review de cerveza
        beer_name: review.beer.name,  # Nombre de la cerveza
        rating: review.rating,  # Calificación de la cerveza
        review_text: review.text,  # Texto de la review
        created_at: review.created_at.iso8601,  # Fecha de la review
        user_name: review.user.handle  # Nombre del usuario que escribió la review
      })
    end

    feed.sort_by! { |post| post[:created_at] }.reverse!

    render json: feed
  end
end