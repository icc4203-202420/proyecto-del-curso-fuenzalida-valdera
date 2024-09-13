class API::V1::EventsController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy]
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
          attendees: event.users.map do |user|
            {
              id: user.id,
              name: "#{user.first_name} #{user.last_name}",
              handle: user.handle
            }
          end
        }
      end
    }
  end

  def show
    bar = Bar.find(params[:id])
    events = bar.events
  
    events_with_attendees = events.map do |event|
      attendees = Attendance.where(event_id: event.id).includes(:user).map do |attendance|
        {
          id: attendance.user.id,
          name: attendance.user.name,
          avatar_url: attendance.user.avatar_url
        }
      end
  
      event.as_json.merge(attendees: attendees)
    end
  
    render json: { events: events_with_attendees }
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
  
    if current_user.nil?
      render json: { success: false, message: 'User not authenticated' }, status: :unauthorized
      return
    end
  
    attendance = Attendance.find_or_initialize_by(user_id: current_user.id, event_id: event.id)
  
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

  private

  def set_event
    @event = Event.find_by(id: params[:id])
    render json: { error: 'event not found' }, status: :not_found if @event.nil?
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
end
