class API::V1::FeedController < ApplicationController
  def index
    user_id = params[:user_id]
    if user_id.nil?
      render json: { error: 'User ID is missing' }, status: :unauthorized and return
    end

    current_user = User.find_by(id: user_id)
    unless current_user
      render json: { error: 'Invalid user ID' }, status: :unauthorized and return
    end

    friend_ids = current_user.friends.pluck(:id)


    event_pictures = EventPicture.includes(:event, :user).where(user_id: [current_user.id, *friend_ids]).order(created_at: :desc)
    reviews = Review.includes(:user, :beer).where(user_id: [current_user.id, *friend_ids]).order(created_at: :desc)

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

    feed.sort_by! { |post| post[:created_at] }.reverse!

    render json: feed
  end
end