/*
 *@author: Hubert Jędrzejek
 *@email: Hubert.Jedrzejek@gmail.com
 */

String.prototype.format = String.prototype.f = function() {
    var s = this,
    i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

String.prototype.ucfirst= function() {
    var s = this;
    return s.charAt(0).toUpperCase() + s.slice(1);
}
;
(function ( $, window, undefined ) {
    var pluginName = 'validator'
    
    var helperMethods= {
        isNumber: function(n){
            n= helperMethods.removeMaskChars(n);
            if(!isNaN(parseFloat(n)) && isFinite(n)){
                return true;
            }
            return false;
        },
        
        removeMaskChars: function(str){
            if(!str){
                return '';
            }
            return str.replace(/ /g,'').replace(/-/g, '').replace(/_/g, '');
        },
    
        validationFailed: function(testName, validator){
            validator.testsSummary[testName]=false;
            return false;
        },

        validationSuccess: function(testName, validator){
            validator.testsSummary[testName]=true;
            return true;
        },
        
        setClass: function(validator){
            validator.$element.removeClass(validator.options.errorClass);
            validator.$element.removeClass(validator.options.successClass);
            if(validator.valid){
                validator.$element.addClass(validator.options.successClass);
            }else{
                validator.$element.addClass(validator.options.errorClass);
            }
        },
        
        addToErrorHolder: function(validator){
            if(!validator.options.errorHolderId){
                return;
            }
            var errorHolderName='';
            if(validator.options.errorHolderPrependId){
                errorHolderName+=validator.$element.attr('id');
            }else if(validator.options.errorHolderPrependName){
                errorHolderName+=validator.$element.attr('name');
            }
            errorHolderName+=validator.options.errorHolderId;
            if(validator.options.errorHolderApendId){
                errorHolderName+=validator.$element.attr('id');
            }else if(validator.options.errorHolderApendName){
                errorHolderName+=validator.$element.attr('name');
            }
            
            var holder= $('#'+errorHolderName);
            for(output in validator.testsSummary){
                if(validator.testsSummary[output]===false){
                    var fieldname='';
                    if(validator.$element.attr('data-translation')){
                        fieldname= validator.$element.attr('data-translation');
                    }else if(validator.$element.attr('name')){
                        fieldname= validator.$element.attr('name');
                    }
                    title+=validatorMessages[validator.options.language][output].format(fieldname, validator.options[output])+'<br />';
                }
            }
            holder.appendChild(title)
        },
        
        addTitleForTooltip: function(validator){
            var title='';
            for(output in validator.testsSummary){
                if(validator.testsSummary[output]===false){
                    var fieldname='';
                    if(validator.$element.attr('data-translation')){
                        fieldname= validator.$element.attr('data-translation');
                    }else if($("[for=name]") && $("[for=name]").text().trim()){
                        fieldname= $("[for=name]").text().trim();
                    }else if(validator.$element.attr('name')){
                        fieldname= validator.$element.attr('name');
                    }
                    title+=validatorMessages[validator.options.language][output].format(fieldname, validator.options[output])+'<br />';
                }
            }
            title= title.substring(0,title.length-6);
            if(title.length){
                validator.$element.attr("title",title);
            }else{
                validator.$element.attr("title",'');
                validator.$element.attr("original-title",'');
            }
        }
    }
    
    var document = window.document
    var defaults = {
        required: false,
        checkMinLength: false,
        checkMaxLength: false,
        checkLength: false,
        checkIsNumber: false,
        checkEmail: false,
        checkPhone: false,
        equalsTo:false,
        checkPostcode: false,
        checkNip: false,
        checkRegon: false,
        checkPesel: false,
        checkPersonalId: false,
        checkRegexp: false,
        errorHolderId: false,
        errorMessageWraper:false,
        errorHolderPrependId:false,
        errorHolderPrependName:false,
        errorHolderApendId:false,
        errorHolderApendName:false,
        language:'pl',
        errorClass:'invalid',
        successClass:'valid',
        tooltip:true,
        debug:false
    };
    var defaultRegexp={
        email: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|pl|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/,
        postcode: /[0-9]{2}-[0-9]{3}/,
        personalId: /[a-zA-Z]{3}[0-9]{6}/
    }
    
    var validatorMessages= {
        pl: {
            required: 'Pole jest wymagane.',
            checkMinLength: 'Pole wymaga podania co najmniej {1} znak�w.',
            checkMaxLength: 'Pole wymaga podania najwy\u017cej {1} znak�w.',
            checkLength: 'Pole wymaga podania dok\u0142adnie {1} znak�w.',
            checkIsNumber: 'Pole wymaga podania liczby.',
            checkEmail: 'Adres email jest niepoprawny.',
            checkPhone: 'Numer telefonu jest niepoprawny.',
            checkPostcode: 'Kod pocztowy jest niepoprawny',
            checkNip: 'Nip jest niepoprawny',
            checkRegon: 'Regon jest niepoprawny',
            checkPesel: 'Pesel jest niepoprawny',
            checkPersonalId:'Seria i numer dowodu osobistego są niepoprawne',
            checkRegexp: 'Pole wymaga formatu "{1}"',
            equalsTo: 'Pole ma inn\u0105 warto�� ni� pole "{2}"'
        }
    }
     
    var validationMethods= {
        required: function(validator){
            if(validator.$element.is(':checkbox')){
                if(!validator.$element.is(':checked')){
                    return helperMethods.validationFailed('required', validator);
                }
                return helperMethods.validationSuccess('required', validator);
            }else if(!helperMethods.removeMaskChars(validator.$element.val()).length){
                return helperMethods.validationFailed('required', validator);
            }
            return helperMethods.validationSuccess('required', validator);
        },
        checkMinLength: function(validator){
            if(helperMethods.removeMaskChars(validator.options.checkMinLength)==0){
                if(validator.options.debug){
                    console.warn('MinLength set to 0. Empty input will be valid if required is not set to true.');
                }
                return helperMethods.validationSuccess('checkMinLength', validator);
            }
            if(helperMethods.removeMaskChars(validator.$element.val()).length<validator.options.checkMinLength){
                return helperMethods.validationFailed('checkMinLength', validator);
            }
            return helperMethods.validationSuccess('checkMinLength', validator);
            
        },
        checkMaxLength: function(validator){
            if(helperMethods.removeMaskChars(validator.options.checkMinLength)==0){
                if(validator.options.debug){
                    console.warn('MaxLength set to 0. Empty input will be valid if required not set to true.');
                }
                return helperMethods.validationSuccess('checkMaxLength', validator);
            }
            if(helperMethods.removeMaskChars(validator.$element.val()).length>validator.options.checkMaxLength){
                return helperMethods.validationFailed('checkMaxLength', validator);
            }
            return helperMethods.validationSuccess('checkMaxLength', validator);
        },
        checkLength: function(validator){
            if(helperMethods.removeMaskChars(validator.$element.val())==0){
                return helperMethods.validationSuccess('checkLength', validator);
            }
            if(helperMethods.removeMaskChars(validator.$element.val()).length!=validator.options.checkLength){
                return helperMethods.validationFailed('checkLength', validator);
            }
            return helperMethods.validationSuccess('checkLength', validator);
        },
        checkIsNumber: function(validator){
            if(helperMethods.removeMaskChars(validator.$element.val()).length==0){
                return helperMethods.validationSuccess('checkIsNumber', validator);
            }
            if(!helperMethods.isNumber(helperMethods.removeMaskChars(validator.$element.val()))){
                return helperMethods.validationFailed('checkIsNumber', validator);
            }
            return helperMethods.validationSuccess('checkIsNumber', validator);
        },
        checkEmail: function(validator){
            if(validator.$element.val().length==0){
                return helperMethods.validationSuccess('checkEmail', validator);
            }
            if(!defaultRegexp.email.test(validator.$element.val())){
                return helperMethods.validationFailed('checkEmail', validator);
            }
            return helperMethods.validationSuccess('checkEmail', validator);
            
        },
        checkPhone: function(validator){
            if(helperMethods.removeMaskChars(validator.$element.val()).length==0){
                return helperMethods.validationSuccess('checkPhone', validator);
            }
            var value= helperMethods.removeMaskChars(validator.$element.val());
            if(helperMethods.isNumber(value) && value.length==9 && value[0]!=0){
                return helperMethods.validationSuccess('checkPhone', validator);
            }else if(helperMethods.isNumber(value) && value.length==11){
                return helperMethods.validationSuccess('checkPhone', validator);
            }else if(value[0]=='+' && value.length==10 && helperMethods.isNumber(value.replace(/\+/g, ''))){
                return helperMethods.validationSuccess('checkPhone', validator);
            }
            return helperMethods.validationFailed('checkPhone', validator);
            
        },
        checkPostcode: function(validator){
            if(validator.$element.val().length==0){
                return helperMethods.validationSuccess('checkPostcode', validator);
            }else if(validator.$element.val().length==6 &&  defaultRegexp.postcode.test(validator.$element.val())){
                return helperMethods.validationSuccess('checkPostcode', validator);
            }else if(validator.$element.val().length==5 && helperMethods.isNumber(validator.$element.val())){
                return helperMethods.validationSuccess('checkPostcode', validator);
            }
            return helperMethods.validationFailed('checkPostcode', validator);
        },
        checkNip: function(validator){
            if(helperMethods.removeMaskChars(validator.$element.val()).length==0){
                return helperMethods.validationSuccess('checkNip', validator);
            }
            var value= helperMethods.removeMaskChars(validator.$element.val());
            if(value.length != 10 || !helperMethods.isNumber(value)){
                return helperMethods.validationFailed('checkNip', validator);
            }
            var arrSteps = new Array(6, 5, 7, 2, 3, 4, 5, 6, 7);
            var intSum=0;
            for (var i=0; i < 9; i++){
                intSum += arrSteps[i] * value[i];
            }
            var intFinal = intSum % 11;
            var intControlNr=(intFinal == 10)?0:intFinal;
            if(intControlNr == value[9]){
                return helperMethods.validationSuccess('checkNip', validator);
            }
            return helperMethods.validationFailed('checkNip', validator);
        },
        checkRegon: function(validator){
            if(helperMethods.removeMaskChars(validator.$element.val()).length==0){
                return helperMethods.validationSuccess('checkRegon', validator);
            }
            var value= helperMethods.removeMaskChars(validator.$element.val());
            if(value.length != 9 || !helperMethods.isNumber(value)){
                return helperMethods.validationFailed('checkRegon', validator);
            }
            var arrSteps = new Array(8, 9, 2, 3, 4, 5, 6, 7);
            var intSum=0;
            for(var i = 0; i < 8; i++){
                intSum += arrSteps[i] * value[i];
            }
            var intFinal = intSum % 11;
            var intControlNr=(intFinal == 10)?0:intFinal;
            if (intControlNr == value[8]){
                return helperMethods.validationSuccess('checkRegon', validator);
            }
            return helperMethods.validationFailed('checkRegon', validator);
        },
        checkPesel: function(validator){
            if(helperMethods.removeMaskChars(validator.$element.val()).length==0){
                return helperMethods.validationSuccess('checkPesel', validator);
            }
            var value= helperMethods.removeMaskChars(validator.$element.val());
            if (value.length!=11 || !helperMethods.isNumber(value)){
                return false;
            }
            var arrSteps = new Array(1, 3, 7, 9, 1, 3, 7, 9, 1, 3); 
            var intSum = 0;
            for (var i = 0; i < 10; i++){
                intSum += arrSteps[i] * value[i]; 
            }
            var intFinal = 10 - intSum % 10; 
            var intControlNr = (intFinal == 10)?0:intFinal;
            if (intControlNr == value[10]){
                return true;
            }
            return false;
        },
        
        checkPersonalId: function(validator){
            if(helperMethods.removeMaskChars(validator.$element.val()).length==0){
                return helperMethods.validationSuccess('checkPersonalId', validator);
            }
            
            var value= helperMethods.removeMaskChars(validator.$element.val());
                        
            if(value.length!=9){
                return helperMethods.validationFailed('checkPersonalId', validator);
            } 
                        
            if(!defaultRegexp.personalId.test(validator.$element.val())){
                return helperMethods.validationFailed('checkPersonalId', validator);
            }
                                   
            var charArray = {"A":"10","B":"11","C":"12","D":"13","E":"14","F":"15","G":"16","H":"17","I":"18","J":"19","K":"20","L":"21","M":"22","N":"23","O":"24","P":"25","Q":"26","R":"27","S":"28","T":"29","U":"30","V":"31","W":"32","X":"33","Y":"34","Z":"35"};           
            var weight = [7,3,1,9,7,3,1,7,3];
            var sum=0;
            for(var i = 0; i < value.length; i++)
                {   
                    if(i<=2){
                        sum += parseInt(charArray[value[i].toUpperCase()])*weight[i];
                    }
                    if(i>2){
                        sum += parseInt(value[i])*weight[i];
                    }
                }
            
            if(sum%10===0){
               return helperMethods.validationSuccess('checkPersonalId', validator); 
            }
            return helperMethods.validationFailed('checkPersonalId', validator);
            return false;
        },
        
        checkRegexp: function(validator){
            if(validator.$element.val().length==0){
                return helperMethods.validationSuccess('checkRegexp', validator);
            }
            if(!validator.options.checkrRegexp.test(validator.$element.val())){
                return helperMethods.validationFailed('checkRegexp', validator);
            }
            return helperMethods.validationSuccess('checkRegexp', validator);
        },
        
        equalsTo: function(validator){
            if(validator.$element.val().length==0 || !$('#'+validator.options.equalsTo).length){
                return helperMethods.validationSuccess('equalsTo', validator);
            }
            if(validator.$element.val()!=$('#'+validator.options.equalsTo).val()){
                return helperMethods.validationFailed('equalsTo', validator);
            }
            return helperMethods.validationSuccess('equalsTo', validator);
        }
    }
    
    var controlerMethods= {
        remove: function(validator){
            delete validator;
            delete $.data(this, 'plugin_' + pluginName);
        },
        validate: function(validator){
            if(validator.$element.is('form')){
                validator.$element.validateForm();
            }else if(validator.$element.is('fieldset')){
                validator.$element.validateFieldset();
            }else{
                for(var methodName in validationMethods){
                    if(validator.options[methodName]!==false){
                        eval('validator.valid= validator.valid & validationMethods.'+methodName+'(validator)');
                    }
                }
                helperMethods.setClass(validator);
                if(validator.options.errorHolderId){
                }
                if(validator.options.tooltip){
                    helperMethods.addTitleForTooltip(validator)
                }
                if(validator.options.debug){
                    console.debug(validator);
                }
            }
        } 
    }

    function validator( element, options ) {
        this.element = element;
        this.$element= $(element);
        this.options = $.extend( {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.testsSummary={};
        this.valid=true;
        this.init();
        switch(options.method){
            case 'validate':
                controlerMethods.validate(this);
                break;
            case 'remove':
                controlerMethods.remove(this);
                break;
        }
    }

    validator.prototype.init = function () {
    
    };
    
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new validator( this, options ));
            }
            else{
                var extended= $.extend({},$.data(this, 'plugin_' + pluginName).options,options);
                $.data(this, 'plugin_' + pluginName, new validator( this, extended ));
            }
        });
    }
    
    $.fn.validate= function(){
        var options= {
            method:'validate'
        };
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new validator( this, options ));
            }
            else{
                var extended= $.extend({},$.data(this, 'plugin_' + pluginName).options,options);
                $.data(this, 'plugin_' + pluginName, new validator( this, extended ));
            }
        });
    }
    
    $.fn.removeAllValidation= function(){
        var options= {
            method:'remove'
        };
        return this.each(function () {
            if($.data(this, 'plugin_' + pluginName)){
                var extended= $.extend({},$.data(this, 'plugin_' + pluginName).options,options,defaults);
            }else{
                var extended=defaults;
            }
            $.data(this, 'plugin_' + pluginName, new validator( this, extended ));
        });
    }
    
    $.fn.isValid= function(){
        var options= {
            method:'validate'
        };
        var valid=true;
        var object;
        this.each(function () {
            if($(this).is('form') || $(this).is('fieldset')){
                valid= valid & $(this).find('input, textarea, select').not(':button').isValid();
            }else if (!$.data(this, 'plugin_' + pluginName)) {
                object=new validator(this,options);
                valid= valid & object.valid;
            }
            else{
                var extended= $.extend({},$.data(this, 'plugin_' + pluginName).options,options);
                object= new validator(this,extended);
                valid= valid & object.valid;
            }
        });
        return valid;
    }
    
    $.fn.validateForm= function(){
        return this.each(function(){
            $(this).find('input, textarea, select').not(':button').validate();
        });
    }
    
    $.fn.validateFieldset= function(){
        return this.each(function(){
            $(this).find('input, textarea, select').not(':button').validate();
        });
    }
    
    $.fn.removeValidation= function(methodName){
        var options= {};
        options[methodName]=false;
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                
            }
            else{
                var extended= $.extend({},$.data(this, 'plugin_' + pluginName).options,options);
                $.data(this, 'plugin_' + pluginName, new validator( this, extended ));
            }
        });
    }

}(jQuery, window));