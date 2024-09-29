class API::V1::EventPicturesController < ApplicationController


  def create
    @event = Event.find(params[:event_id])
    @event_picture = @event.event_pictures.new(event_picture_params)


    if @event_picture.save
      render json: {
        id: @event_picture.id,
        image_url: url_for(@event_picture.image),  # Incluye la URL de la imagen al devolver la respuesta
        description: @event_picture.description
      }, status: :created
    else
      Rails.logger.debug @event_picture.errors.full_messages
      render json: @event_picture.errors, status: :unprocessable_entity
    end

  end

  private

  def event_picture_params
    params.require(:event_picture).permit(:image, :description, :user_id)
  end
end
