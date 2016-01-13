describe("HappyFilterComponent", function() {
  beforeEach(function() {
    loadFixtures("happy-filter.html");
    HappyFilterComponent.attachTo('.happy-toggle');
  });

  describe("active state", function() {
    it("defaults state", function() {
      expect($(".happy-toggle")).not.toHaveClass('btn-success');
      expect($(".happy-toggle")).not.toHaveClass('btn-danger');
    });

    describe("when clicked once", function() {
      beforeEach(function() {
        $(".happy-toggle").trigger('click');
      });

      it("will be green", function() {
         expect($(".happy-toggle")).toHaveClass('btn-success');
         expect($(".happy-toggle")).not.toHaveClass('btn-danger');
      })

      describe("and clicked a second time", function() {
        beforeEach(function() {
          $(".happy-toggle").trigger('click');
        });

        it("will be red", function() {
          expect($(".happy-toggle")).toHaveClass('btn-danger');
          expect($(".happy-toggle")).not.toHaveClass('btn-success');
        });

      })
    });
  });
});
