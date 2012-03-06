ENV['RACK_ENV'] = 'development'

require 'mongoid'
Mongoid.load!("mongoid.yml")
Mongoid.logger = Logger.new($stdout)

class Game
  include Mongoid::Document
  include Mongoid::Timestamps
  
  #attr_accessible :name, :by, :platform, :rate, :price, :scrape_url, :img_url, :esrb, :digital, :slug
  
  field :name, :type => String
  field :published_date, :type => Date
  field :platforms, :type => Array
  field :genres, :type => Array
  field :tags, :type => Array
  
  key :name
  
  validates_presence_of :name
  validates_uniqueness_of :name, :case_sensitive => false
  
end

class Genre
  include Mongoid::Document
  
  field :_id
  field :name
  field :ratings, :type => Array
  field :order, :type => Float, :default => 0.0
  
  #key :name
  
  validates_presence_of :name
  validates_uniqueness_of :name, :case_sensitive => false
end

class RatingLabel
  include Mongoid::Document
  
  field :name
  field :labels, :type => Array
  field :tooltip
  
  key :name
  
  validates_presence_of :name
  validates_uniqueness_of :name, :case_sensitive => false
end

class Platform
  include Mongoid::Document
  
  field :_id
  field :name
  field :order, :type => Float, :default => 0.0
  
  validates_presence_of :name
  validates_uniqueness_of :name, :case_sensitive => false
end

class Tag
  include Mongoid::Document
  
  field :_id
  field :name
  field :order, :type => Float, :default => 0.0
  
  validates_presence_of :name
  validates_uniqueness_of :name, :case_sensitive => false
end


