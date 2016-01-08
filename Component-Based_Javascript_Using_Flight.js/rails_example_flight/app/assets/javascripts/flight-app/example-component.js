var ExampleComponent = (function() {
  return flight.component(function() {
    this.attributes({
      name: '#example_name',
      email: '#example_email',
      gender: 'input[name=example\\[gender\\]]:checked',
      agree: '#example_agree',
      summary: '.example-summary',
    });

    this.example = function() {
      return {
        name: this.select('name').val(),
        email: this.select('email').val(),
        gender: this.select('gender').val(),
        agree: this.select('agree').prop("checked")
      };
    }

    this.refreshSummary = function(){
      this.select('summary').text(this.jsonStringify(this.example()));
    }

    this.after('initialize', function () {
      this.on('change keyup', this.refreshSummary);
      this.trigger('change');
    });

  }, withJsonStringify);
})();

$(document).ready(function () {
  ExampleComponent.attachTo('.example-form');
});
