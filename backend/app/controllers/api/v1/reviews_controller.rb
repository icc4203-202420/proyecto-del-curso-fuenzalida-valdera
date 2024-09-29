class API::V1::ReviewsController < ApplicationController
  respond_to :json
  before_action :set_review, only: [:show, :update, :destroy]

  # GET /api/v1/beers/:beer_id/reviews
  def index
    beer = Beer.find(params[:beer_id])

    # Configura los parámetros de paginación
    page = (params[:page] || 1).to_i
    per_page = (params[:per_page] || 5).to_i

    # Calcular el offset
    offset = (page - 1) * per_page

    # Obtener las reseñas con limit y offset
    reviews = beer.reviews.includes(:user).limit(per_page).offset(offset) # Incluye el usuario

    # Contar el total de reseñas para calcular total_pages
    total_reviews = beer.reviews.count
    total_pages = (total_reviews.to_f / per_page).ceil

    # Renderiza las reseñas incluyendo el handle del usuario
    render json: {
      reviews: reviews.map { |review| 
        {
          id: review.id,
          text: review.text,
          rating: review.rating,
          user: {
            id: review.user.id,
            handle: review.user.handle
          }
        }
      },
      total_pages: total_pages
    }
  end

  def show
    render json: @review, status: :ok
  end

  def create
    current_user = get_current_user_from_token
    beer = Beer.find(params[:beer_id])
    review = beer.reviews.build(review_params)
  
    review.user = current_user
  
    if review.save
      render json: review, status: :created
    else
      render json: { errors: review.errors.full_messages }, status: :unprocessable_entity # Muestra los errores
    end
  end  

  def update
    if @review.update(review_params)
      render json: @review, status: :ok
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @review.destroy
    head :no_content
  end

  private

  def set_review
    @review = Review.find_by(id: params[:id])
    render json: { error: "Review not found" }, status: :not_found unless @review
  end

  def review_params
    params.require(:review).permit(:rating, :text) # Permite estos parámetros
  end

  def get_current_user_from_token
    token = request.headers['Authorization']&.split(' ')&.last # Obtiene el token del encabezado
    return unless token

    begin
      decoded_token = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
      User.find(decoded_token['user_id']) # Encuentra el usuario por ID en el token
    rescue JWT::DecodeError
      nil # En caso de error al decodificar, devuelve nil
    end
  end
end