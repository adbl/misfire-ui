function ViewModel() {
    var self = this;
    self.uri = 'http://localhost:4000/measures';
    self.measures = ko.observableArray();
    self.values_uri_template = null;

    self.ajax = function(uri, method, data) {
        var request = {
            url: uri,
            type: method,
            // accepts: accept,
            contentType: "application/vnd.api+json",
            cache: false,
            data: JSON.stringify(data),
            // dataType: 'json',
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus + "\n" + errorThrown + "\n\n" +
                            jqXHR.status + " " + jqXHR.statusText + "\n" +
                            jqXHR.getAllResponseHeaders() + "\n" +
                            jqXHR.responseText);
            }
        };
        return $.ajax(request);
    }

    self.ajax(self.uri, 'GET').done(function(data) {
        self.measure_values_uri = function(measure) {
            return data.links['measures.values'].href.replace(
                "{measures.id}", measure.id())
        }

        // TODO use underscore iteration
        _.forEach(data.measures, function(measure) {
            current_value = _.find(data.linked.values, function (value) {
                return _.has(measure, "links") &&
                    _.has(measure.links, "current_value") &&
                    measure.links.current_value == value.id
            });
            if (current_value)
                current_timestamp = current_value.timestamp;
            else
                current_timestamp = null;

            measure = {
                id: ko.observable(measure.id),
                name: ko.observable(measure.name),
                type: ko.observable(measure.type),
                current_timestamp: ko.observable(current_timestamp)
            };
            measure.updated = ko.computed(function() {
                ts = measure.current_timestamp()
                if (ts) return moment(new Date(ts)).fromNow();
                else return "never"
            });
            self.measures.push(measure);
        });
    });

    self.doMeasure = function(measure, event) {
        console.log("doMeasure: " + measure.name());
        data = {"values": [{"value": 1,
                            "timestamp": (new Date()).toISOString()}]};
        // TODO handle error
        self.ajax(self.measure_values_uri(measure), 'POST', data).done(
            function(data) {
                measure.current_timestamp(data.values[0].timestamp);
            }
        );
    }
    self.beginAdd = function() {
        console.log("beginAdd");
    }
}
ko.applyBindings(new ViewModel(), $('#main')[0]);
