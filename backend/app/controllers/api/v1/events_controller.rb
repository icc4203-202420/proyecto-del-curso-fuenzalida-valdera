class API::V1::EventsController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy, :generate_summary]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]
  before_action :authenticate_user!, only: [:create, :update, :destroy]

  def index
    @events = Event.where(bar_id: params[:bar_id])

    render json: {
      events: @events.map do |event|
        {
          id: event.id,
          name: event.name,
          description: event.description,
          date: event.date,
          flyer_url: event.flyer.attached? ? url_for(event.flyer) : nil,
          attendees: event.users.map do |user|
            {
              id: user.id,
              name: "#{user.first_name} #{user.last_name}",
              handle: user.handle
            }
          end,
          event_pictures: event.event_pictures.map do |picture|
            {
              id: picture.id,
              image_url: url_for(picture.image),
              description: picture.description
            }
          end
        }
      end
    }
  end

  def show
    address = Address.find_by(id: Bar.find_by(id: @event.bar_id).address_id)
    @event_pictures = @event.event_pictures
    Rails.logger.info "Addresses are: #{address}"

    event_pictures_data = @event_pictures.map do |picture|
      { id: picture.id, description: picture.description, image_url: url_for(picture.image) }
    end

    if @event.flyer.attached?
      render json: @event.as_json.merge({
        image_url: url_for(@event.image),
        thumbnail_url: url_for(@event.thumbnail)
      }), status: :ok
    else
      render json: {
        event: @event.as_json,
        address: address,
        event_pictures: event_pictures_data
      }, status: :ok
    end
  end

  def create
    @event = Event.new(event_params.except(:image_base64))
    handle_image_attachment if event_params[:image_base64]

    if @event.save
      render json: { event: @event, message: 'event created successfully.' }, status: :created
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def update
    handle_image_attachment if event_params[:image_base64]

    if @event.update(event_params.except(:image_base64))
      render json: { event: @event, message: 'event updated successfully.' }, status: :ok
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @event.destroy
    head :no_content
  end

  def check_in
    event = Event.find_by(id: params[:id])

    if event.nil?
      render json: { success: false, message: 'Event not found' }, status: :not_found
      return
    end

    user_id = params[:user_id]
    user = User.find_by(id: user_id)

    if user.nil?
      render json: { success: false, message: 'User not found' }, status: :not_found
      return
    end

    attendance = Attendance.find_or_initialize_by(user_id: user.id, event_id: event.id)

    if attendance.checked_in
      render json: { success: false, message: 'Already checked in' }, status: :unprocessable_entity
    else
      if attendance.update(checked_in: true)
        render json: { success: true, message: 'Checked in successfully' }, status: :ok
      else
        render json: { success: false, message: 'Failed to check in' }, status: :unprocessable_entity
      end
    end
  end

  def generate_summary
    # Use the instance variable set by before_action
    event = @event
    Rails.logger.debug("Parameters: #{params.inspect}")

    # Actualizar la URL del video para que apunte a la nueva ubicación
    video_url = "#{request.protocol}#{request.host_with_port}/videos/event_#{event.id}.mp4"

    # Start the background job for video generation
    GenerateVideoSummaryJob.perform_later(event.id)
    Rails.logger.debug(video_url)

    # Return the video URL (it may not be ready yet)
    render json: { success: true, message: "Video generation started.", video_url: video_url }
  end

  private

  def set_event
    @event = Event.find(params[:id])
  end

  def event_params
    params.require(:event).permit(:name, :description, :date, :bar_id, :image_base64)
  end

  def handle_image_attachment
    decoded_image = decode_image(event_params[:image_base64])
    @event.image.attach(io: decoded_image[:io],
      filename: decoded_image[:filename],
      content_type: decoded_image[:content_type])
  end

  def verify_jwt_token
    authenticate_user!
    head :unauthorized unless current_user
  end

  def create_event_summary(event)
    # Implementar la lógica para crear el resumen aquí
    # Por ejemplo, simular que se generó un resumen exitoso
    { success: true }
  end

  def send_notifications(event)
    attendees = event.users

    attendees.each do |user|
      NotificationService.send_summary_notification(user, event)
    end
  end
end
