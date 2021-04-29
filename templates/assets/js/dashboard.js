(function ($) {
    $.ajax({
        url: '/api/storedaction',
        type: 'get',
        success: function (response) {
            $('#stored-actions').text(response.length);
        },
        error: function (xhr) {
            console.log('Error getting stored actions');
        }
    });

    $.ajax({
        url: '/api/implant',
        type: 'get',
        success: function (response) {
            $('#unique-implants').text(response.length);
            temp_nodes_data = [{ id: 'Teamserver', label: "Team Server" }];
            temp_edges_data = [];
            if (response != null) {
                for (var i = 0; i < response.length; i++) {
                    temp_nodes_data.push({
                        id: response[i]['uuid'],
                        label: response[i]['primary_ip']
                    });
                    temp_edges_data.push({
                        from: response[i]['uuid'],
                        to: 'Teamserver'
                    });
                }

                var nodes = new vis.DataSet(temp_nodes_data);
                var edges = new vis.DataSet(temp_edges_data);

                var container = document.getElementById("vis_network");
                var data = {
                    nodes: nodes,
                    edges: edges
                };
                var options = {
                    height: '315px',
                    layout: {
                        hierarchical: {
                            direction: "DU",
                            sortMethod: "directed",
                            parentCentralization: false
                        },
                    },
                    physics: {
                        enabled: true,
                    },
                    interaction: {
                        navigationButtons: false,
                        selectConnectedEdges: false
                    }
                };
                var fitOption = {
                    nodes: nodes.getIds()
                }
                var network = new vis.Network(container, data, options);
                network.fit(fitOption);
            }
        },
        error: function (xhr) {
            console.log('Error getting implants');
        }
    });

    $.ajax({
        url: '/api/stagedactionfrontend',
        type: 'get',
        success: function (response) {
            if (response == null) {
                $('#pending-actions').text(0);
            } else {
                $('#pending-actions').text(response.length);
            }
        },
        error: function (xhr) {
            console.log('Error getting staged actions');
        }
    });

    $.ajax({
        url: '/api/executedactionfrontend',
        type: 'get',
        success: function (response) {
            if (response == null) {
                $('#number-actions-sent').text(0);
            } else {
                $('#number-actions-sent').text(response.length);
            }

            var temp_successful_data = [];
            var temp_unsuccessful_data = [];
            var successful_data = [];
            var unsuccessful_data = [];
            var saved_labels = [];
            var modules_used = {};
            var num_actions = response.length;
            if (response != null) {
                for (var i = 0; i < response.length; i++) {
                    if (response[i]['executed_action']['successful'] == true) {
                        temp_successful_data.push(moment.utc(response[i]['executed_action']['time_sent']).local());
                    } else {
                        temp_unsuccessful_data.push(moment.utc(response[i]['executed_action']['time_sent']).local());
                    }
                    if (!(response[i]['stored_action']['module_to_run'] in modules_used)) {
                        modules_used[response[i]['stored_action']['module_to_run']] = {
                            num: 1,
                        };
                    } else {
                        modules_used[response[i]['stored_action']['module_to_run']]['num']++;
                    }
                    saved_labels.push(moment.utc(response[i]['executed_action']['time_sent']).local());
                }

                let sorted_successful_data = temp_successful_data.sort((a, b) => a.diff(b))
                let sorted_unsuccessful_data = temp_unsuccessful_data.sort((a, b) => a.diff(b))
                saved_labels = saved_labels.sort((a, b) => a.diff(b))
                for (var i = 0; i < sorted_successful_data.length; i++) {
                    successful_data.push({ x: sorted_successful_data[i].toString(), y: i + 1 });
                }
                for (var i = 0; i < sorted_unsuccessful_data.length; i++) {
                    unsuccessful_data.push({ x: sorted_unsuccessful_data[i].toString(), y: i + 1 });
                }
            }

            var temp = [];
            for (var key in modules_used) {
                modules_used[key]['adjusted'] = modules_used[key]['num'] / num_actions * 100;
                modules_used[key]['name'] = key;
                temp.push(modules_used[key]);
            }

            temp.sort(function (a, b) {
                return ((a.adjusted < b.adjusted) ? 1 : ((a.adjusted == b.adjusted) ? 0 : -1));
            });

            var num_to_show = temp.length > 5 ? 5 : temp.length;
            var colors = ['danger', 'warning', 'primary', 'info', 'success'];

            for (var i = 0; i < num_to_show; i++) {
                $('#most-used-modules').append(`<h4 class="small font-weight-bold">${temp[i]['name']}<span class="float-right">${temp[i]['adjusted'].toFixed(2)}%</span></h4>
                    <div class="progress mb-4">
                    <div class="progress-bar bg-${colors[i]}" aria-valuenow="${temp[i]['adjusted'].toFixed(2)}" aria-valuemin="0" aria-valuemax="100" style="width: ${temp[i]['adjusted'].toFixed(2)}%;"><span class="sr-only">${temp[i]['adjusted'].toFixed(2)}%</span></div>
                </div>`);
            }

            var ctx = $('#actions-ran-chart').find('canvas');
            var chart = new Chart(ctx, {
                type: 'line',
                labels: saved_labels,
                data: {
                    datasets: [{
                        label: 'Successful',
                        data: successful_data,
                        borderColor: 'rgba(78, 115, 223, 1)',
                        backgroundColor: 'rgba(78, 115, 223, 0.05)'
                    },
                    {
                        label: 'Unsuccessful',
                        data: unsuccessful_data,
                        borderColor: 'rgb(255,0,0)',
                        backgroundColor: 'rgba(78, 115, 223, 0.05)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                display: true,
                                autoSkip: true,
                                maxTicksLimit: 5
                            }
                        }],
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'minute'
                            },
                            ticks: {
                                display: true,
                                autoSkip: true,
                                maxTicksLimit: 5
                            }
                        }]
                    }
                }
            });
            chart.update();
        },
        error: function (xhr) {
            console.log('Error getting executed actions');
        }
    });

    $.ajax({
        url: '/api/implanttype',
        type: 'get',
        success: function (response) {
            var saved_data = [];
            var saved_labels = [];
            var saved_colors = [];
            var type_map = {};

            var dynamicColors = function () {
                var hue = Math.floor(Math.random() * 360);
                return `hsl(${hue}, 70%, 80%)`;
            }
            if (response != null) {
                for (var i = 0; i < response.length; i++) {
                    type_map[response[i]['uuid']] = {
                        num: 0,
                        name: `${response[i]['implant_name']} ${response[i]['implant_version']}`
                    }
                }
                $.ajax({
                    url: '/api/implant',
                    type: 'get',
                    success: function (response) {
                        for (var i = 0; i < response.length; i++) {
                            if (type_map[response[i]['uuid_implant_type']]['num'] == 0) {
                                type_map[response[i]['uuid_implant_type']]['color'] = dynamicColors();
                            }
                            type_map[response[i]['uuid_implant_type']]['num']++;
                        }
                        for (var key in type_map) {
                            saved_labels.push(type_map[key]['name']);
                            saved_data.push(type_map[key]['num']);
                            saved_colors.push(type_map[key]['color']);
                        }

                        var ctx = $('#implant-types-chart').find('canvas');
                        var chart = new Chart(ctx, {
                            type: 'doughnut',
                            data: {
                                datasets: [{
                                    label: "Implant Types",
                                    data: saved_data,
                                    backgroundColor: saved_colors
                                }],
                                labels: saved_labels,
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                circumference: Math.PI,
                                rotation: -Math.PI,
                                legend: {
                                    display: true,
                                    position: 'bottom',
                                }
                            },
                        });
                        chart.update();
                    },
                    error: function (xhr) { }
                });
            }

        },
        error: function (xhr) {
            console.log('Error getting executed actions');
        }
    });
})(jQuery); // End of use strict
