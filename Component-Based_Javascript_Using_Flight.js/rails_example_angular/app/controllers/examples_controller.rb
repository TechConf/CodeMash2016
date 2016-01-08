class ExamplesController < ApplicationController
  before_action :set_example, only: [:show, :edit, :update, :destroy]

  def index
    @examples = Example.all
  end

  def new
    @example = Example.new
  end

  def create
    @example = Example.new(example_params)

    if @example.save
      redirect_to examples_path, notice: 'Example was successfully created.'
    else
      render :new
    end
  end
  def update
    if @example.update(example_params)
      redirect_to examples_path, notice: 'Example was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @example.destroy
    redirect_to examples_url, notice: 'Example was successfully destroyed.'
  end

  private
    def set_example
      @example = Example.find(params[:id])
    end

    def example_params
      params.require(:example).permit(:name, :email, :gender, :agree)
    end
end
