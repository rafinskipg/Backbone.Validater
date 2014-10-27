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
              if(!field.filters){
                return self.model.get(field.name);
              }else{
                return self.getFilteredValuesFromField(field);
              }
            });

            if(!self[condition.validation].apply(self, arguments)){
              condition.fields.forEach(function(field){
                issues.push({
                  field: field.name,
                  validation: condition.alias || condition.validation
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
          condition.fields.forEach(function(field){
            if(!self.fieldFulfillsCondition(field)){
              valid = false;
            }
          });

          if(valid){
            return condition;
          }
        }));

        return conditions;
      },
      fieldFulfillsCondition: function(field){
        var valid = true;
        if(field.exists){
          //It requests to have a field set with value
          if(!this.model.get(field.name) || !this.hasContent(this.model.get(field.name)) ){
            valid = false;
          }else if(field.filters && field.filters.length > 0){
            var foundValuesFiltered = this.getFilteredValuesFromField(field);
            if(!this.hasContent(foundValuesFiltered)){
              valid = false;
            }
          } 
        }else{
          //It requests to have a field empty
          if(this.model.get(field.name) && this.hasContent(this.model.get(field.name)) ){
            valid = false;
          }
        }
        return valid;
      },
      getFilteredValuesFromField: function(field){
        if(_.isArray(this.model.get(field.name))){
          return this.filterArrayValues(field);
        }else{
          return this.filterObjectValues(field);
        }
      },
      filterArrayValues: function(field){
        var self = this;
        return _.filter(this.model.get(field.name), function(val){ 
            var valid = true;
            field.filters.forEach(function(filter){
              var value = val[filter.field];
              if(!value 
                || (filter.value && (value != filter.value) )
                || (!filter.value && !self.hasContent(value))){
                valid = false;
              }
            });
            return valid;
          });
      },
      filterObjectValues: function(field){
        var fieldData = this.model.get(field.name);
        var valid = true;
        var self = this;

        field.filters.forEach(function(filter){
          var value = fieldData[filter.field];
          if(!value 
            || (filter.value && (value != filter.value) )
            || (!filter.value && !self.hasContent(value))){
            valid = false;
          }
        });
        return valid ? fieldData : null;
      },
      extractConditionsFromBindings: function(){
        var conditions = [];
        var self = this;
        for(var validation in this.validations){
          var condition = {};
          var fieldsString = validation;
          //Extract aliases
          var alias = this.getAliasFromConditionString(validation);
          if(alias.length > 0){
            fieldsString = validation.replace(alias+':', '');
            condition.alias = alias;
          }

          //Extract fields
          var fields = this.getFieldsFromFieldsString(fieldsString);
          condition.fields = fields;

          //Get field filters
          condition.fields = condition.fields.map(function(field){
            var filters = self.getFiltersFromField(field.name);
            if(filters){
              field.filters = filters;
              field.name = self.removeFiltersStringFromField(field.name);
            }
            return field;
          })


          var validations = this.validations[validation];
          
          if(typeof(validations) == 'string'){
            condition.validation = validations;
            conditions.push(condition);
          }else{

            validations.forEach(function(val){
              var cond = _.clone(condition);
              cond.validation = val;
              conditions.push(cond);
            });
          }
        }
        return conditions;
      },
      getAliasFromConditionString: function(conditionString){
        var index = conditionString.indexOf(':');
        if(index != -1){
          return conditionString.substr(0,index);
        }
        return '';
      },
      getFieldsFromFieldsString: function(fieldsString){
        return fieldsString.match(/[^&]+(?=\{)\{\S+\}|[^&]+/g).map(function(field){
          var exists = field.indexOf('!') == -1;
          field = field.replace('!', '');
          return {
            name: field,
            exists: exists
          }
        });
      },
      removeFiltersStringFromField: function(field){
        var re = /{([^}]*)}/;
        var match = re.exec(field)[0];
        return field.replace(match, '');
      },
      getFiltersFromField: function(field){
        var re = /{([^}]*)}/;
        if(re.test(field)){
          var match = re.exec(field)[1];
          var fields = this.getFieldsFromFieldsString(match);
          fields = fields.map(function(fieldObject){
            var returningObject = {
              field : fieldObject.name
            }
            
            var indexOfEqual = fieldObject.name.indexOf('=');
            if(indexOfEqual != -1){
              returningObject.field = fieldObject.name.substr(0, indexOfEqual);
              returningObject.value = fieldObject.name.substr(indexOfEqual+1,fieldObject.name.length).replace(/\"/g,'');
            }  

            return returningObject;
          });
          return fields;
        }else{
          return null;
        }
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