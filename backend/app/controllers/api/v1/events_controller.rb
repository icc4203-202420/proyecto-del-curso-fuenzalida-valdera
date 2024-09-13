class API::V1::EventsController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]
  before_action :authenticate_user!, only: [:create, :update, :destroy]

  def index
    if params[:bar_id]
      @events = Event.where(bar_id: params[:bar_id])
      render json: { events: @events }, status: :ok
    else
      @events = Event.all
      render json: { events: @events }, status: :ok
    end
  end

  def show
    event = Event.find(params[:id])
    user = User.find(params[:user_id])
    friends = user.friends.pluck(:id)
  
    attendees = event.attendances.includes(:user)
                      .order(Arel.sql("CASE WHEN users.id IN (#{friends.join(',')}) THEN 0 ELSE 1 END"))
                      .map(&:user)
  
    render json: { event: event, attendees: attendees }
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
