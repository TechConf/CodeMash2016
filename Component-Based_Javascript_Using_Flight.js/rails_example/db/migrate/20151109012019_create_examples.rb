class CreateExamples < ActiveRecord::Migration
  def change
    create_table :examples do |t|
      t.string :name
      t.string :email
      t.integer :gender
      t.boolean :agree
      t.timestamps null: false
    end
  end
end
