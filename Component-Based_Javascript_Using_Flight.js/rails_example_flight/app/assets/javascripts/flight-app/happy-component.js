var HappyComponent = (function() {
  return flight.component(function() {
    this.attributes({
      icon: '.fa',
      tree_icon: 'fa-tree',
      boat_icon: 'fa-ship',
      fire_icon: 'fa-fire',
      moon_icon: 'fa-moon-o',
      sun_icon: 'fa-sun-o',
    });

    this.iconApplicable = function(iconName) {
      return this.$node.data(iconName);
    }

    this.renderIcons = function(){
      this.addIconIfApplicable('boat');
      this.addIconIfApplicable('fire');
      this.addIconIfApplicable('moon');
      this.addIconIfApplicable('sun');
      this.addIconIfApplicable('tree');
    }

    this.addIconIfApplicable = function(iconName) {
      if (this.iconApplicable(iconName)) {
        this.$node.append(this.render('icon', { icon: this.attr[iconName + '_icon'] } ));
      }
    }

    this.toggleVisibility = function(visible) {
      if (visible) {
        this.$node.show();
      } else {
        this.$node.hide();
      }
    }

    this.applyHappyFilter = function(ev, data) {
      if (this.iconApplicable(data.icon)) {
        this.toggleVisibility(data.visible);
      } else {
        this.toggleVisibility(!data.visible);
      }
    }

    this.after('initialize', function() {
      this.templates({
        icon: '#icon-template'
      });
      this.renderIcons();
      this.on(document, 'happyFilterChanged', this.applyHappyFilter);
    });
  }, withHandlebarsView);
})();
