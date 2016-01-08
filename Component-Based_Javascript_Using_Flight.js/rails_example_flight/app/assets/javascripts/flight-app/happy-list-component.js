var HappyListComponent = (function() {
  return flight.component(function() {
    this.attributes({
      items: []
    });

    this.refreshEpisodes = function(ev, data){
      this.attr.items = data.items;
      this.trigger('happyEpisodesRefreshed');
    }

    this.renderEpisodes = function(){
      this.$node.empty();
      this.$node.append(this.render('list', this.attr));
      HappyComponent.attachTo('.happy-item');
    }

    this.after('initialize', function() {
      this.templates({
        list: '#list-template'
      });

      this.on(document, 'happyEpisodesRetrieved', this.refreshEpisodes);
      this.on('happyEpisodesRefreshed', this.renderEpisodes);
    });
  }, withHandlebarsView);
})();

$(document).ready(function () {
  HappyListComponent.attachTo('#happy-list');
  $.get('/happy.json', function( items ) {
    $(document).trigger('happyEpisodesRetrieved', { items: items} );
  });
});
