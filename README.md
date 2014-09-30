
#Backbone validator [![Build Status](https://travis-ci.org/rafinskipg/Backbone.Validater.svg?branch=master)](https://travis-ci.org/rafinskipg/Backbone.Validater) [![Code Climate](https://codeclimate.com/github/rafinskipg/Backbone.Validater/badges/gpa.svg)](https://codeclimate.com/github/rafinskipg/Backbone.Validater)




A backbone plugin that simplifies (at least for me) the validation on models.

You need to define your validator classes like this:

````
var MyValidator = Backbone.validator.extend({
  validations : {
    'name' : 'isValidName'
  },
  isValidName: function(name){
    if(name === 'notValidGuy'){
      return false;
    }
    return true;
  }
});
````
````

var myModel = Backbone.Model.extend({
  requiredFields: ['name', 'street', 'phone'], //All fields will be checked to not be empty, it also does a deep check in objects and arrays
  validate: function(){
    this.validator = new MyValidator({
      model: this
    });
    return this.validator.validate(); //Returns null if everything goes well, 
                                      //an array of erros if some field validations fail
  }
});
````

Other example configs on validations: 

````
validations: {
  'oneField': 'checkThatFieldIsValid',
  'oneField&otherField': 'checkConditionsWhenTwoFieldsPresent',
  'oneField&!missingField': 'checkConditionWhenFieldMissing',
  '!missingField': 'checkConditionWhenFieldMissing'
}
````
##Operators

- `&` AND operator
- `|` OR operator //NOT IMPLEMENTED
- `!` indicates that a field is missing 

##Contribute

BECAUSE TITS!
