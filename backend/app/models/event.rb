class Event < ApplicationRecord
  belongs_to :bar
  has_many :attendances
  has_many :users, through: :attendances
  has_many :event_pictures, dependent: :destroy

  has_one_attached :flyer

  def thumbnail
    flyer.variant(resize_to_limit: [200, nil]).processed
  end
  after_create :notify_video_ready

  def notify_video_ready
    ActionCable.server.broadcast("video_notification_channel", { type: 'video_ready', message: 'Your video is ready for viewing!' })
  end
end
