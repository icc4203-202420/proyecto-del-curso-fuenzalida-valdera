class API::V1::UsersController < ApplicationController
  respond_to :json
  before_action :set_user, only: [:show, :update] 
  before_action :authenticate_user!, only: [:create, :update, :destroy, :friendships, :create_friendship]
  
  def index
    @users = User.includes(:reviews, :address).all   
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
    friend = User.find_by(id: params[:friend_id])

    if friend.nil?
      render json: { error: "Couldn't find friend"}, status: :not_found
      return
    end

    @friendship = @user.friendships.build(friend: friend, bar_id: params[:bar_id])
    if @friendship.save
      render json: @friendship, status: :created
    else
      render json: @friendship.errors, status: :unprocessable_entity
    end
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
