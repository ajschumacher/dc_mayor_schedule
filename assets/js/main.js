!function(){

	function initHelpers(){
		Handlebars.registerHelper('parseEvent', function(event, headers, options){
			var ret = '';
			_.forEach(headers, function(header){
				var val = event[header];
				if(header === 'datetime')
					val = moment(val).format('MM/DD/YY, h:mma');
				ret += options.fn(val);
			});
			return ret;
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
	
		sync: function(method, model, options) {
			var params = _.extend({
				type: 'GET',
				dataType: 'text',
				url: _.result(model, 'url'),
			}, options);
	 
			return Backbone.$.ajax(params);
		},

		parse : function(csv){
			var rows = csv.replace(/\n(.+)\n(.*)(?=")/g, '\n$1 $2').split('\n');
			// There was something wierd going on character wise with the headers
			// So the regex fixes this by filtering out non-letter characers
			var headers = _.map(rows.shift().split(','), function(header){
				return header.match(/\w+/)[0];
			});
			var events = crossfilter(_(rows).map(function(row){
				var vals = row.split(',').map(function(field){
					return field.replace('^"|"$', '');
				});
				return _.zipObject(headers, vals);
			}).reject(function(d){
				return _.contains(d, undefined);
			}).value());
			var dateDimension = events.dimension(this.parseDate);
			return {
				events : events,
				rawEvents : dateDimension.top(Infinity),
				dateDimension : dateDimension,
				headers : headers
			};
		},

		parseDate : function(d){
			return moment(d.datetime).toDate().valueOf();
		}

	});

	var EventsTable = Backbone.View.extend({
		template : templates.events,

		initialize : function(){
			this.listenTo(this.model, 'change:rawEvents', this.render);
		},

		render : function(){
			this.$el.html(this.template(this.model.toJSON()));
		}
	});

	var Router = window.Router = Backbone.Router.extend({
		initialize : function(){
			this.events = new Events();
			this.eventsTable = new EventsTable({
				model : this.events
			});
			this.eventsTable.$el.appendTo(Backbone.$('#events_table_container'));
			this.events.fetch();
		}

	});
	
}();
