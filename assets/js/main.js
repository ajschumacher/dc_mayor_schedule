!function(){

	function initHelpers(){
		var addressRegex = /\d+[^\(]+/;
		Handlebars.registerHelper('parseEvent', function(event, headers, options){
			var ret = '';
			_.forEach(headers, function(header){
				var val = event[header];
				if(header === 'datetime')
					val = moment(val).format('MM/DD/YYYY, h:mma');
				if(header === 'venue'){
					var addressMatch = val.match(addressRegex);
					if(addressMatch){
						var address = addressMatch[0];
						val = val.replace(
							addressRegex, 
							'<a target="_blank" href="https://www.google.com/maps/place/'+address.replace(/\s/g, '+')+'">'+address+'</a>'
						);
					}
				}
				ret += options.fn(val);
			});
			return ret;
		});
		Handlebars.registerHelper('isEmpty', function(array, headers, options){
			if(!array.length)
				return options.fn({
					colspan : headers.length
				});
			else
				return _.map(array, options.inverse).join('\n');
		});
	}

	function parseTemplates(){
		var templates = {};
		$('script[type="script/x-handlebars-template"]').each(function(){
			var el = $(this);
			var id = el.attr('id');
			var template = Handlebars.compile(el.html());
			if(el.data('partial') === true)
				Handlebars.registerPartial(id, template);
			else
				templates[id] = template;
		});
		return templates;
	}

	initHelpers();
	var templates = parseTemplates();
	
	var Events = Backbone.Model.extend({
		url : 'data/mayor_events.csv',

		filterDate : function(selectedDate){
			var filter = _.bind(function(){
				this.get('dateDimension').filterFunction(function(timestamp){
					return  moment(timestamp).isSame(selectedDate, 'day');
				});
				this.set('rawEvents', this.get('dateDimension').bottom(Infinity));
			}, this);

			if(this.get('dateDimension'))
				filter();
			else
				this.listenToOnce(this, 'change:dateDimension', filter);
		},
	
		sync: function(method, model, options) {
			var params = _.extend({
				type: 'GET',
				dataType: 'text',
				url: _.result(model, 'url'),
			}, options);
	 
			return Backbone.$.ajax(params);
		},

		parse : function(csv){
			var rows = csv.replace(/\n(.+)\n(.*)(?=")/g, '\n$1 $2').split(/"\n|\r\n|\n/);
			// There was something wierd going on character wise with the headers
			// So the regex fixes this by filtering out non-letter characers
			var headers = _.map(rows.shift().split(','), function(header){
				return header.match(/\w+/)[0];
			});
			var events = crossfilter(_(rows).map(function(row){
				var vals = row.replace(/"(.+),(.+)"/, '$1%COMMA%$2').split(/,/).map(function(field){
					return field.replace('%COMMA%', ',').replace(/^"\s*|^\s+|\s*"$|\s+$/g, '');
				});
				return _.zipObject(headers, vals);
			}).reject(function(d){
				return _.contains(d, undefined);
			}).value());
			var dateDimension = events.dimension(this.parseDate);
			return {
				events : events,
				dateDimension : dateDimension,
				headers : headers
			};
		},

		parseDate : function(d){
			return moment(d.datetime).toDate().valueOf();
		}

	});

	var DatePicker = Backbone.View.extend({
		template : templates.date_picker,

		initialize : function(){
			this.listenTo(this.model, 'change:dateDimension', this.render);
		},

		setDate : function(date){
			this.date = date;
			if(this.picker) this.picker.setDate(date);
		},

		render : function(){
			this.$el.html(this.template());
			var maxDate = moment(this.model.get('dateDimension').top(1)[0].datetime);
			var minDate = moment(this.model.get('dateDimension').bottom(1)[0].datetime);
			var date = this.date || moment();
			this.picker = this.$('.date').datetimepicker({
					pickTime : false,
					minDate : minDate,
					maxDate : maxDate
				})
				.on('dp.change', _.bindKey(this, 'triggerChange'))
				.data('DateTimePicker');
			this.picker.setDate(date);
			this.triggerChange();
		},

		triggerChange : function(){
			this.trigger('ui.date.change', this.picker.getDate());
		}
	});

	var EventsTable = Backbone.View.extend({
		template : templates.events_table,

		headerTitles : {
			'datetime' : 'Date',
			'event' : 'Description',
			'venue' : 'Venue',
			'comment' : 'Comments'
		},

		initialize : function(){
			this.listenTo(this.model, 'change:rawEvents', this.render);
		},

		render : function(){
			var context = {
				rawEvents : this.model.get('rawEvents'),
				headerTitles : _.map(this.model.get('headers'), function(header){
					return this.headerTitles[header] || header;
				}, this),
				headers : this.model.get('headers')
			};

			this.$el.html(this.template(context));
		}
	});

	var Router = window.Router = Backbone.Router.extend({
		initialize : function(){
			this.events = new Events();
			this.eventsTable = new EventsTable({
				model : this.events
			});
			this.datePicker = new DatePicker({
				model : this.events
			});
			this.listenTo(this.datePicker, 'ui.date.change', this.changeDate);
			this.datePicker.$el.appendTo(Backbone.$('#date_picker_container'));
			this.eventsTable.$el.appendTo(Backbone.$('#events_table_container'));
			this.events.fetch();
		},

		routes : {
			'date/:date' : 'filterModel'
		},

		changeDate : function(date){
			window.location.hash = '#/date/'+date.format('MM-DD-YYYY');
		},

		filterModel : function(dateString){
			var date = moment(dateString);
			this.datePicker.setDate(date);
			this.events.filterDate(date);
		}

	});
	
}();
