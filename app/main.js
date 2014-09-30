(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jQuery', '_', 'Backbone'], factory);
    } else {
        // Browser globals
        root.amdWeb = factory(root.jQuery, root._, root.Backbone);
    }
}(this, function ($, _, Backbone) {
    
    /**
     Backbone validator 0.0.1 
    */
    var BackboneValidator = Backbone.View.extend({
      validations: {

      },
      hasContent : function (objectToCheck){

        if(_.isBoolean(objectToCheck)){
          return true;
        }

        if(_.isArray(objectToCheck) && objectToCheck.length > 0){
          return true;
        }

        //Object with keys
        if(!_.isArray(objectToCheck) && _.keys(objectToCheck).length > 0){
          var keys = _.keys(objectToCheck);
          for(var i = 0; i < keys.length; i++){
            if(this.hasContent(objectToCheck[keys[i]])){
              return true;
            }
          }
          return false;
        }

        if(_.isFinite(objectToCheck) || !_.isEmpty(objectToCheck)){
          return true;
        }

        //Null, '', undefined, [], {}
        return false;
      },

      checkRequiredFields: function(){
        var obj = this.model.toJSON();
        var fails = [];

        for(var n in this.model.requiredFields) {
          var propName = this.model.requiredFields[n];
          if(!this.hasContent(obj[propName])){
            fails.push({
              field: propName,
              validation: 'required'
            });
          }
        }
        return fails.length > 0 ? fails : null;
      },
      customValidations: function(){
        var conditionsFulfilled = this.getConditionsFulfilled();
        var issues = [];
        
        if(conditionsFulfilled.length > 0){
          var self = this;
          
          conditionsFulfilled.forEach(function(condition){
            var arguments = condition.fields.map(function(field){
              return self.model.get(field);
            });

            if(!self[condition.validation].apply(self, arguments)){
              condition.fields.forEach(function(field){
                issues.push({
                  field: field,
                  validation: condition.validation
                })
              });
            }

          });
        }      

        return issues;
      },
      getConditionsFulfilled: function(){
        var conditions = this.extractConditionsFromBindings();
        var self = this;

        conditions = _.compact(conditions.map(function(condition){
          var valid = true;
          condition.fields = condition.fields.map(function(field){
            if(field.indexOf('!') != 0){
              //It requests to have a field set with value
              if(!self.model.get(field) || !self.hasContent(self.model.get(field)) ){
                valid = false;
              }  
            }else{
              //It requests to have a field empty
              field = field.replace('!', '');
              if(self.model.get(field) && self.hasContent(self.model.get(field)) ){
                valid = false;
              }
            }
            return field;
          });
          if(valid){
            return condition;
          }
        }));

        return conditions;
      },
      extractConditionsFromBindings: function(){
        var conditions = [];
        for(var validation in this.validations){
          var condition = {};
          var fields = validation.split('&');
          condition.fields = fields;
          condition.validation = this.validations[validation];
          conditions.push(condition);
        }
        return conditions;
      },
      validate: function(){
        var issues = _.compact(Array.prototype.concat(this.checkRequiredFields(), this.customValidations()));
        return issues.length > 0 ? issues  : null
      }
    });

    //Version
    BackboneValidator.VERSION = "<% VERSION %>";

    // Expose through Backbone object.
    Backbone.validator = BackboneValidator;

    return BackboneValidator;
}));