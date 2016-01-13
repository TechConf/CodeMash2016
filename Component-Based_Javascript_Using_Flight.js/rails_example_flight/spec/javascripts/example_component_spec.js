describe("ExampleComponent", function() {
  beforeEach(function() {
    loadFixtures("example.html");
  });

  it("basic initialization", function() {
    ExampleComponent.attachTo('.example-form');

    expect($(".example-summary").val()).toEqual("");
  });

  describe("when a name is entered", function() {
    beforeEach(function() {
      $('#example_name').val('joe');
      ExampleComponent.attachTo('.example-form');
    });

    it("json summary includes the name", function() {
      expect($(".example-summary").html()).toMatch('joe');
    });

    it("name changes are reflected in json summary", function() {
      ChangeValue('#example_name','sally');
      expect($(".example-summary").html()).toMatch('sally');
    });
  });
});
