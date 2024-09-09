class API::V1::ReviewsController < ApplicationController
  respond_to :json
  before_action :set_review, only: [:show, :update, :destroy]

  # GET /api/v1/beers/:beer_id/reviews
  def index
    @reviews = Review.where(beer_id: params[:beer_id])
                      .page(params[:page])
                      .per(params[:per_page])
    render json: @reviews, each_serializer: ReviewSerializer, status: :ok
  end

  def show
    if @review
      render json: @review, status: :ok
    else
      render json: { error: "Review not found" }, status: :not_found
    end
  end

  def create
    @review = Review.new(review_params)
    if @review.save
      render json: @review, status: :created, location: api_v1_review_url(@review)
    else
      render json: @review.errors, status: :unprocessable_entity
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
    params.require(:review).permit(:text, :rating, :beer_id)
  end
end
