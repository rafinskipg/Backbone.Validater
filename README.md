
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

## Various fields 

```
validations: {
  'oneField&otherField': 'checkConditionsWhenTwoFieldsPresent'
},
//Fields are received as params
checkConditionsWhenTwoFieldsPresent: function(fieldOne, fieldTwo){
  if(fieldOne > 10 && fieldTwo === 'sue'){
    return true; //Valid case
  }else{
    return false;
  }
}

/** In case of error it will return 
  [{ 
    field : 'oneField', 
    validation : 'checkConditionsWhenTwoFieldsPresent'
  },{ 
    field : 'fieldTwo', 
    validation : 'checkConditionsWhenTwoFieldsPresent'
  }] 
**/
```

## Alias

```
validations: {
  'myFieldAlias:oneField': 'checkOneField'
},

checkOneField: function(fieldValue){
  //...
}

/** In case of error it will return 
  [{ 
    field : 'myFieldAlias', 
    validation : 'checkOneField'
  }]
**/
```

## Return custom error

```
validations: {
  'oneField': 'checkOneField'
},

checkOneField: function(fieldValue){
  if(fails){
    return 'My custom error here';
  }
  return true;
}

/** In case of error it will return 
  [{ 
    field : 'oneField', 
    validation : ''My custom error here''
  }]
**/
```

## Array of objects filtered
In case you need to validate that in some array of data a field is present

```
validations: {
  'myArrayField{objectProperty="value"&otherObjectProperty="value2"}': 'checkOneField'
},

checkOneField: function(fieldValueFiltered){
  //...
}

/** It will search in the array for fields that match
  { 
    objectProperty : 'value', 
    otherObjectProperty : 'value2'
  }
  and it will trigger the validation with that field as parameter if it is found
**/
```

## Object filtering
Trigger validation if object has some properties (optionally set to some values )

```
validations: {
  'myObjectField{objectProperty="value"&otherObjectProperty&!thirdObjectProperty}': 'checkOneField'
},

checkOneField: function(myObjectField){
  //...
}

/** It will trigger the validation if the object match the conditions
**/
```

## More examples

````
validations: {
  'oneField': 'checkThatFieldIsValid',
  'oneField&otherField': 'checkConditionsWhenTwoFieldsPresent',
  'oneField&!missingField': 'checkConditionWhenFieldMissing',
  '!missingField': 'checkConditionWhenFieldMissing',
  'arrayField{name="pepe"}': 'conditionIfNameIsPepe',
  'namePepeFound:arrayField{name="pepe"}': 'conditionIfNameIsPepe',
  'objectField{name="pepe"}': 'conditionIfNameIsPepe',
  'objectField{name&surname}': 'conditionIfObjectHasNameAndSurname',
  'objectField{nestedProperty.subNested.subsubNested="true"}'
}
````

## Operators

- `&` AND operator
- `|` OR operator //NOT IMPLEMENTED
- `!` indicates that a field is missing 
- `{}` for containing filters for arrays
- `aliasName:` for indicating aliases, must be placed at the beggining of the string, acts as an alias for the field

##Contribute

BECAUSE TITS!
