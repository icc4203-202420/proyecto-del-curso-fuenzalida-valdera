class API::V1::EventPicturesController < ApplicationController
  def create
    @event = Event.find(params[:event_id])
    @event_picture = @event.event_pictures.new(event_picture_params)
    @event_picture.user = current_user

    if @event_picture.save
      render json: @event_picture, status: :created
    else
      Rails.logger.debug @event_picture.errors.full_messages
      render json: @event_picture.errors, status: :unprocessable_entity
    end
  end

  private

  def event_picture_params
    params.require(:event_picture).permit(:image, :description) # Ajusta según tus atributos
  end
end
