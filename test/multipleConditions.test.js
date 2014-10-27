describe("Multiple conditions", function() {

  var myObj;
  //Some model using our validator
  var validator;

  beforeEach(function(){
    //Create a model with some stuff
    myObj = new Backbone.Model({});

    var CustomValidator = Backbone.validator.extend({
      validations: {
        'phone': ['integerPositive', 'nameIsPepino']
      },
      integerPositive: function(val){
        return !isNaN(val) && _.isNumber(val) && val > 0;
      },
      nameIsPepino: function(){

      }
    });

    validator = new CustomValidator({
      model: myObj
    });

  });

  it('Should detect the two conditions', function(){
    var conditions = validator.extractConditionsFromBindings();
    expect(conditions.length).toBe(2);
    expect(conditions[0].validation).toBe('integerPositive');
    expect(conditions[1].validation).toBe('nameIsPepino');
  });
  
});