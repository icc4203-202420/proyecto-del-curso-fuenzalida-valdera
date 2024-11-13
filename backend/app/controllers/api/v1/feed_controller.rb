class API::V1::FeedController < ApplicationController
  def index
    event_pictures = EventPicture.includes(:event, :user).order(created_at: :desc)

    reviews = Review.includes(:user, :beer).order(created_at: :desc)

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
        user_name: review.user.handle ,
        beer_id: review.beer.id
      })
    end

    feed.sort_by! { |post| post[:created_at] }.reverse!

    render json: feed
  end
end