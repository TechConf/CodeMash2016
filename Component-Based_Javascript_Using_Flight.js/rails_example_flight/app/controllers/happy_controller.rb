require 'csv'
require 'json'

class HappyController < ApplicationController
  @@episodes = nil
  def index
    respond_to do |format|
      format.html { render template: "happy/index" }
      format.json { render json: bob_ross_episodes }
    end
  end

  def bob_ross_episodes
    @@episodes ||= CSV.open(File.join(Rails.root, "lib", "data", "bob-ross-episodes.csv"), headers: true,header_converters: :symbol, converters: :all).readlines.map(&:to_h)
  end

  def episodesX
    @@episodes ||= CSV.open(File.join(Rails.root, "lib", "data", "bob-ross-episodes.csv"), headers: true,header_converters: :symbol, converters: :all).readlines.map(&:to_h)
  end
end
