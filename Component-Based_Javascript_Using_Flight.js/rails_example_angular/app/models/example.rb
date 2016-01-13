class Example < ActiveRecord::Base
  enum gender: [:male, :female]
end
