var myModelWithValidator =  Backbone.Model.extend({
  requiredFields: ['name', 'street', 'phone'],

  initialize : function(){
    this.validator = new Backbone.validator({
      model: this
    });
  },
  
  validate: function(){
    return this.validator.validate();
  }
});