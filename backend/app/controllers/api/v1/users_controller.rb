class API::V1::UsersController < ApplicationController
  respond_to :json
  before_action :set_user, only: [:show, :update] 
  before_action :authenticate_user!, only: [:create, :update, :friendships, :create_friendship]
  
  def index
    if params[:handle]
      @users = User.where("LOWER(handle) LIKE ?", "%#{params[:handle].downcase}%")
      render json: @users
    else
      render json: { error: 'Handle not provided' }, status: :bad_request
    end
  end

  def show ; end

  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user.id, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def update
    #byebug
    if @user.update(user_params)
      render :show, status: :ok, location: api_v1_users_path(@user)
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def friendships
    @friendships = @user.friendships.include(:friend)
    friends = @friendships.map(&:friend)
    render json: friends, status: :ok
  end

  def create_friendship
    friend = User.find(params[:friend_id])
    current_user.friendships.create(friend: friend, bar_id: params[:bar_id])

    render json: { message: 'Amigo agregado exitosamente' }, status: :created
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Usuario no encontrado' }, status: :not_found
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.fetch(:user, {}).
        permit(:id, :first_name, :last_name, :email, :age,
            { address_attributes: [:id, :line1, :line2, :city, :country, :country_id, 
              country_attributes: [:id, :name]],
              reviews_attributes: [:id, :text, :rating, :beer_id, :_destroy]
            })
  end
end
