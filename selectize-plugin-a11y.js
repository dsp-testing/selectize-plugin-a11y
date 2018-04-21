Selectize.define("selectize-plugin-a11y", function(options) {
  let self = this;
  if (typeof self.accessibility === "undefined") {
    self.accessibility = {};
  }

  self.accessibility.helpers = {
    randomId: function(len) {
      let str = "",
        strLength = len || 10,
        base = "abcdefghijklmnopqrstuvwxyz0123456789",
        baseLength = base.length;

      for (let i = 0; i < strLength; i++) {
        str += base[Math.floor(baseLength * Math.random())];
      }

      return str;
    }
  };

  self.accessibility.liveRegion = {
    $region: "",
    speak: function(msg) {
      let $msg = $("<div>" + msg + "</div>");
      this.$region.html($msg);
    },
    domListener: function() {
      let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          let $target = $(mutation.target);
          if ($target.hasClass("items")) {
            if ($target.hasClass("dropdown-active")) {
              // open
              self.$control_input.attr("aria-expanded", "true");
            } else {
              // close
              self.$control_input.attr("aria-expanded", "false");
              self.$control_input.removeAttr("aria-activedescendant");
            }
          } else {
            // option change
            if ($target.hasClass("active")) {
              if (!!$target.attr("data-value")) {
                self.$control_input.attr(
                  "aria-activedescendant",
                  $target.attr("id")
                );
                self.accessibility.liveRegion.speak($target.text(), 500);
              }
            }
          }
        });
      });
      observer.observe(self.$dropdown[0], {
        attributeFilter: ["class"],
        subtree: true,
        attributeOldValue: true
      });

      observer.observe(self.$control[0], {
        attributeFilter: ["class"]
      });

      observer.observe(self.$control_input[0], {
        attributeFilter: ["value"]
      });
    },
    setAttributes: function() {
      this.$region.attr({
        "aria-live": "assertive",
        role: "log",
        "aria-relevant": "additions",
        "aria-atomic": "true"
      });
    },
    setStyles: function() {
      this.$region.css({
        position: "absolute",
        width: "1px",
        height: "1px",
        "margin-top": "-1px",
        clip: "rect(1px, 1px, 1px, 1px)",
        overflow: "hidden"
      });
    },
    init: function() {
      this.$region = $("<div>");
      this.setAttributes();
      this.setStyles();
      $("body").append(this.$region);
      this.domListener();
    }
  };

  this.setup = (function() {
    let original = self.setup;
    return function() {
      original.apply(this, arguments);
      let inputId = self.accessibility.helpers.randomId(),
        listboxId = self.accessibility.helpers.randomId();

      self.$control.on("keydown", function(e) {
        if (e.keyCode === KEY_RETURN) {
          $(this).click();
        }
      });

      self.$control_input.attr({
        role: "combobox",
        "aria-expanded": "false",
        haspopup: "listbox",
        "aria-owns": listboxId,
        "aria-label": self.$wrapper
          .closest("[data-accessibility-selectize-label]")
          .attr("data-accessibility-selectize-label")
      });

      self.$dropdown_content.attr({
        role: "listbox",
        id: listboxId
      });
      self.accessibility.liveRegion.init();
    };
  })();
});