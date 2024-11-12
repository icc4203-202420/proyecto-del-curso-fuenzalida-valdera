class API::V1::FeedController < ApplicationController
  def index
    event_pictures = EventPicture.includes(:event, :user).order(created_at: :desc)
    events = Event.order(start_date: :desc)

    feed = event_pictures.map do |event_picture|
      {
        image_url: url_for(event_picture.image),  # URL de la imagen almacenada en ActiveStorage
        description: event_picture.description,   # Descripción de la imagen
        created_at: event_picture.created_at.iso8601,    # Fecha de creación
        event_name: event_picture.event.name,    # Nombre del evento (supuesto que el evento tiene un nombre)
        user_name: event_picture.user.handle       # Nombre del usuario (supuesto que el usuario tiene un nombre)
      }
    end

    #feed = (feed + events).sort_by(&:created_at).reverse

    render json: feed
  end
end