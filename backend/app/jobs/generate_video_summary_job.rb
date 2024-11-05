class GenerateVideoSummaryJob < ApplicationJob
  queue_as :default

  def perform(event_id)
    # Directorio temporal para las imágenes procesadas
    Dir.mktmpdir do |tmpdir|
      temp_images = []

      # Descargar y procesar imágenes
      images = download_images(event_id)
      if images.empty?
        Rails.logger.error("No se encontraron imágenes para el evento con ID #{event_id}")
        return  # Salir si no hay imágenes
      end

      images.each_with_index do |event_picture, index|
        unless event_picture.image.attached?
          Rails.logger.error("El EventPicture con ID #{event_picture.id} no tiene una imagen adjunta")
          next
        end

        begin
          processed_image = MiniMagick::Image.read(event_picture.image.download) do |img|
            img.resize "1280x720!"  # Redimensionar a 1280x720
            img.format "jpg"         # Convertir a JPEG
          end

          # Ajustar dimensiones a pares
          width = processed_image.width
          height = processed_image.height
          processed_image.crop "#{width - (width % 2)}x#{height - (height % 2)}+0+0" if width % 2 != 0 || height % 2 != 0

          # Guardar la imagen procesada en un archivo temporal
          image_path = File.join(tmpdir, "event_#{event_id}_img_#{index}.jpg")
          File.open(image_path, "wb") { |file| file.write(processed_image.to_blob) }

          # Verificar que la imagen se haya guardado correctamente
          if File.exist?(image_path) && File.size(image_path) > 0
            temp_images << image_path
            Rails.logger.info("Imagen procesada y guardada: #{image_path}")
          else
            raise "Error: El archivo de imagen temporal no se creó o está vacío: #{image_path}"
          end

        rescue => e
          Rails.logger.error("Error al procesar la imagen: #{e.message}")
          raise e  # Propagar el error para reintentar el trabajo o registrar el fallo
        end
      end

      # Crear el video a partir de las imágenes procesadas
      video_path = create_video_from_images(temp_images, event_id, tmpdir)

      # Notificar al frontend que el video está listo
      notify_video_ready(event_id, video_path)
    end
  end

  private

  def download_images(event_id)
    event = Event.find_by(id: event_id)
    event ? event.event_pictures.with_attached_image : []
  end

  def create_video_from_images(temp_images, event_id, tmpdir)
    concat_file_path = File.join(tmpdir, "concat_list.txt")
    File.open(concat_file_path, "w") do |file|
      temp_images.each do |img|
        file.puts "file '#{img}'"
        file.puts "duration 1"  # Duración de 1 segundo por imagen
      end
    end

    # Ruta para el video de salida en el directorio público
    video_path = Rails.root.join("public", "videos", "event_#{event_id}.mp4")

    # Crear el directorio si no existe
    FileUtils.mkdir_p(File.dirname(video_path))

    # Comando FFmpeg con -y para sobrescribir el archivo existente
    output_command = "ffmpeg -y -f concat -safe 0 -i '#{concat_file_path}' -c:v libx264 -pix_fmt yuv420p '#{video_path}'"

    stdout, stderr, status = Open3.capture3(output_command)

    if status.success?
      Rails.logger.info("Video creado exitosamente: #{video_path}")
      return video_path
    else
      Rails.logger.error("Error al ejecutar FFmpeg: #{stderr}")
      raise "Error al crear el video con FFmpeg: #{stderr}"
    end
  end

  def notify_video_ready(event_id, video_path)
    # Recuperar todos los usuarios
    users = User.all

    # Obtener el host de la configuración de tu aplicación
    host = Rails.application.credentials.dig(:app, :host) || 'localhost:3001' # Cambia esto según tu configuración
    protocol = 'http://'  # O 'https://' dependiendo de tu entorno
    video_url = "#{protocol}#{host}/videos/event_#{event_id}.mp4" # Actualizar la URL

    users.each do |user|
      # Enviar una notificación a cada usuario.
      ActionCable.server.broadcast "video_notification_channel", {
        user_id: user.id,
        message: "El video para el evento '#{event_id}' está listo para ver.",
        video_url: video_url
      }
    end
  end
end
