class API::V1::EventPicturesController < ApplicationController

  def create
    @event = Event.find(params[:event_id])
    @event_picture = @event.event_pictures.new(event_picture_params)

    if @event_picture.save
      # Detectar menciones en la descripción
      mentioned_handles = @event_picture.description.scan(/@(\w+)/).flatten

      # Buscar los usuarios mencionados en la base de datos
      mentioned_users = User.where(handle: mentioned_handles)

      # Enviar notificación push a los usuarios mencionados
      mentioned_users.each do |user|
        send_push_notification(user, @event_picture.description, @event)
      end



      render json: {
        id: @event_picture.id,
        image_url: url_for(@event_picture.image),
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

  # Método para enviar la notificación push
  def send_push_notification(user, description, event)
    # Suponiendo que tienes una columna `push_token` en el modelo User para almacenar el token de notificación
    PushNotificationService.send_notification(
          to: user.push_token,
          title: "Has recibido peticion de amistad!",
          body: "Te han etiquetado.",
          data: { screen: "Main" }
        )

    # Aquí usas el servicio de notificación, como Firebase Cloud Messaging (FCM)
    Firebase::Messaging.send(message)
  rescue => e
    Rails.logger.error "Error sending push notification to user #{user.id}: #{e.message}"
  end
end
