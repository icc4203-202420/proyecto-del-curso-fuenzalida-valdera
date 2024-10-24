class ApplicationController < ActionController::API
  before_action :configure_permitted_parameters, if: :devise_controller?
  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last
    if token.present?
      begin
        payload = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
        @current_user = User.find(payload['sub'])
      rescue JWT::DecodeError
        render json: { error: 'Invalid token' }, status: :unauthorized
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :unauthorized
      end
    else
      render json: { error: 'Token missing' }, status: :unauthorized
    end
  end
  protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[name avatar])
    devise_parameter_sanitizer.permit(:account_update, keys: %i[name avatar])
  end
end
