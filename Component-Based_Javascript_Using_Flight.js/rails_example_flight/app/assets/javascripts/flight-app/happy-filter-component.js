var HappyFilterComponent = (function() {
  return flight.component(function() {
    this.attributes({
      visible: false,
    });

    this.icon = function() {
      $(this.$node).data('icon');
    }

    this.toggleFilter = function() {
      this.attr.visible = !this.attr.visible;

      this.trigger(document, 'happyFilterChanged', {
        icon: this.$node.data('icon'),
        visible: this.attr.visible
      });
    }

    this.refreshUIState = function(ev, data) {
      this.$node.removeClass('btn-success');
      this.$node.removeClass('btn-danger');

      if (this.$node.data('icon') == data.icon){
        if (data.visible) {
          this.$node.addClass('btn-success');
        } else {
          this.$node.addClass('btn-danger');
        }
      }
    }

    this.after('initialize', function() {
      this.on('click', this.toggleFilter);
      this.on(document, 'happyFilterChanged', this.refreshUIState);
    });
  });
})();

$(document).ready(function () {
  HappyFilterComponent.attachTo('.happy-toggle');
});
