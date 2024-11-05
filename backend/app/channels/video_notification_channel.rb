class VideoNotificationChannel < ApplicationCable::Channel
  def subscribed
    stream_from 'video_notification_channel' # Aquí es donde defines el nombre del canal
  end

  def unsubscribed
    # Limpiar cualquier recurso usado por esta conexión
  end
end
