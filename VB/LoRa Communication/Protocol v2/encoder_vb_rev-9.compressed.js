"undefined"!=typeof module&&(module.exports={encodeDownlink:encodeDownlink,Encode:Encode,Encoder:Encoder,encode_header:encode_header,encode_header_v3:encode_header_v3,encode_events_mode:encode_events_mode,encode_base_config:encode_base_config,encode_vb_sensor_config:encode_vb_sensor_config,encode_vb_sensor_data_config_v1:encode_vb_sensor_data_config_v1,encode_vb_sensor_data_config_v2:encode_vb_sensor_data_config_v2,encode_vb_sensor_data_config_v3:encode_vb_sensor_data_config_v3,encode_calculation_trigger:encode_calculation_trigger,encode_fft_trigger_threshold:encode_fft_trigger_threshold,encode_fft_selection:encode_fft_selection,encode_frequency_range:encode_frequency_range,encode_base_config_switch:encode_base_config_switch,encode_device_type:encode_device_type,encode_uint32:encode_uint32,encode_int32:encode_int32,encode_uint16:encode_uint16,encode_int16:encode_int16,encode_uint8:encode_uint8,encode_int8:encode_int8,encode_sci_6:encode_sci_6,calc_crc:calc_crc,encode_status_msg_delay_interval_v3:encode_status_msg_delay_interval_v3,encode_base_config_v3:encode_base_config_v3,encode_base_config_switch_v3:encode_base_config_switch_v3,encode_region_config_v3:encode_region_config_v3,encode_channel_plan_v3:encode_channel_plan_v3,encode_vb_sensor_config_v3:encode_vb_sensor_config_v3,encode_vb_sensor_conditions_configuration_v3:encode_vb_sensor_conditions_configuration_v3,encode_event_condition_v3:encode_event_condition_v3,encode_sensor_config_switch_mask_v3:encode_sensor_config_switch_mask_v3});var mask_byte=255;function _encode(input){input=input.data;var name,output={},bytes=[],protocol_version=(output.bytes=bytes,output.fPort=15,0);for(name in input)void 0!==input[name].protocol_version&&(protocol_version=input[name].protocol_version);switch(protocol_version){case 1:case 2:switch(output.fPort=15,input.header.message_type){case"base_configuration":encode_header(bytes,5,input.header.protocol_version),encode_base_config(bytes,input),encode_uint16(bytes,calc_crc(bytes.slice(1)));break;case"sensor_configuration":if("vb"!==input.device_type)throw new Error("Invalid device type!");encode_header(bytes,6,input.header.protocol_version),encode_vb_sensor_config(bytes,input),encode_uint16(bytes,calc_crc(bytes.slice(1)));break;case"sensor_data_configuration":if("vb"!==input.device_type)throw new Error("Invalid device type!");switch(encode_header(bytes,7,input.header.protocol_version),input.header.protocol_version){case 1:encode_vb_sensor_data_config_v1(bytes,input);break;case 2:encode_vb_sensor_data_config_v2(bytes,input);break;default:throw new Error("Protocol version is not supported!")}encode_uint16(bytes,calc_crc(bytes.slice(1)));break;default:throw new Error("Invalid message type!")}break;case 3:var req_type=Object.keys(input)[0],req=input[req_type];switch(req_type){case"config_update_req":switch(output.fPort=7,req.config_type){case"base":encode_header_v3(bytes,req),void 0!==req.payload&&(encode_uint32(bytes,req.tag),encode_base_config_v3(bytes,req.payload));break;case"region":encode_header_v3(bytes,req),void 0!==req.payload&&(encode_uint32(bytes,req.tag),encode_region_config_v3(bytes,req.payload));break;case"sensor":encode_header_v3(bytes,req),void 0!==req.payload&&(encode_uint32(bytes,req.tag),encode_vb_sensor_config_v3(bytes,req.payload));break;case"sensor_data":encode_header_v3(bytes,req),void 0!==req.payload&&(encode_uint32(bytes,req.tag),encode_vb_sensor_data_config_v3(bytes,req.payload));break;case"sensor_conditions":encode_header_v3(bytes,req),void 0!==req.payload&&(encode_uint32(bytes,req.tag),encode_vb_sensor_conditions_configuration_v3(bytes,req.payload));break;default:throw output.fPort=0,new Error("Invalid config type!")}break;case"calib_update_req":output.fPort=8;break;default:throw new Error("Unknown request type")}break;default:throw new Error("Protocol version is not supported!")}return output}function encodeDownlink(input){try{return _encode(input)}catch(error){return{errors:[error.message]}}}function Encode(fPort,obj){return _encode({data:obj,fPort:fPort}).bytes}function Encoder(obj,fPort){return _encode({data:obj,fPort:fPort}).bytes}function encode_base_config(bytes,obj){var number_of_unconfirmed_messages=0;if(void 0!==obj.number_of_unconfirmed_messages)number_of_unconfirmed_messages=obj.number_of_unconfirmed_messages;else{if(void 0===obj.unconfirmed_repeat)throw new Error("Missing number_of_unconfirmed_messages OR unconfirmed_repeat parameter");number_of_unconfirmed_messages=obj.unconfirmed_repeat}if(void 0===obj.bypass_sanity_check||0==obj.bypass_sanity_check){if(number_of_unconfirmed_messages<1||5<number_of_unconfirmed_messages)throw new Error("number_of_unconfirmed_messages is outside of specification: "+obj.number_of_unconfirmed_messages);if(obj.communication_max_retries<1)throw new Error("communication_max_retries is outside specification: "+obj.communication_max_retries);if(obj.status_message_interval_seconds<60||604800<obj.status_message_interval_seconds)throw new Error("status_message_interval_seconds is outside specification: "+obj.status_message_interval_seconds);if(obj.lora_failure_holdoff_count<0||255<obj.lora_failure_holdoff_count)throw new Error("lora_failure_holdoff_count is outside specification: "+obj.lora_failure_holdoff_count);if(obj.lora_system_recover_count<0||255<obj.lora_system_recover_count)throw new Error("lora_system_recover_count is outside specification: "+obj.lora_system_recover_count)}encode_base_config_switch(bytes,obj.switch_mask),encode_uint8(bytes,obj.communication_max_retries),encode_uint8(bytes,number_of_unconfirmed_messages),encode_uint8(bytes,obj.periodic_message_random_delay_seconds),encode_uint16(bytes,obj.status_message_interval_seconds/60),encode_uint8(bytes,obj.status_message_confirmed_interval),encode_uint8(bytes,obj.lora_failure_holdoff_count),encode_uint8(bytes,obj.lora_system_recover_count),encode_uint16(bytes,obj.lorawan_fsb_mask[0]),encode_uint16(bytes,obj.lorawan_fsb_mask[1]),encode_uint16(bytes,obj.lorawan_fsb_mask[2]),encode_uint16(bytes,obj.lorawan_fsb_mask[3]),encode_uint16(bytes,obj.lorawan_fsb_mask[4])}function encode_base_config_v3(bytes,payload){if(void 0!==payload){if(payload.periodic_message_random_delay_seconds<0||31<payload.periodic_message_random_delay_seconds)throw new Error("periodic_message_random_delay_seconds is outside of specification: "+payload.periodic_message_random_delay_seconds);encode_base_config_switch_v3(bytes,payload.switch_mask),encode_status_msg_delay_interval_v3(bytes,payload.periodic_message_random_delay_seconds,payload.status_message_interval)}}function encode_vb_sensor_config_v3(bytes,payload){if(void 0!==payload){if("vb"!=payload.device_type)throw new Error("Invalid device type!");if(encode_device_type(bytes,payload.device_type),encode_sensor_config_switch_mask_v3(bytes,payload.switch_mask),0==payload.measurement_interval_minutes||240<payload.measurement_interval_minutes)throw new Error("measurement_interval_minutes outside of specification: "+payload.measurement_interval_minutes);if(encode_uint8(bytes,payload.measurement_interval_minutes),10080<payload.periodic_event_message_interval||payload.periodic_event_message_interval<0)throw new Error("periodic_event_message_interval outside of specification: "+payload.periodic_event_message_interval);encode_uint16(bytes,payload.periodic_event_message_interval),encode_frequency_range(bytes,payload.frequency_range.velocity,payload.frequency_range.acceleration)}}function encode_vb_sensor_config(bytes,obj){encode_device_type(bytes,obj.device_type),encode_uint16(bytes,obj.measurement_interval_seconds),encode_uint16(bytes,obj.periodic_event_message_interval),encode_frequency_range(bytes,obj.frequency_range.rms_velocity,obj.frequency_range.peak_acceleration);for(var idx=0,idx=0;idx<6;idx++)encode_events_mode(bytes,obj.events[idx].mode),"off"!=obj.events[idx].mode?encode_int16(bytes,obj.events[idx].mode_value/.01):encode_int16(bytes,0)}function encode_vb_sensor_data_config_v1(bytes,obj){if(encode_device_type(bytes,obj.device_type),encode_calculation_trigger(bytes,obj.calculation_trigger),encode_uint16(bytes,obj.calculation_interval),encode_uint16(bytes,obj.fragment_message_interval),obj.threshold_window%2)throw new Error("threshold_window must be multiple of 2");for(encode_uint8(bytes,obj.threshold_window/2),idx=0;idx<5;idx++)encode_fft_trigger_threshold(bytes,obj.trigger_thresholds[idx].unit,obj.trigger_thresholds[idx].frequency,obj.trigger_thresholds[idx].magnitude);if(encode_fft_selection(bytes,obj.selection),encode_uint16(bytes,obj.frequency.span.velocity.start),encode_uint16(bytes,obj.frequency.span.velocity.stop),encode_uint16(bytes,obj.frequency.span.acceleration.start),encode_uint16(bytes,obj.frequency.span.acceleration.stop),encode_uint8(bytes,obj.frequency.resolution.velocity),encode_uint8(bytes,obj.frequency.resolution.acceleration),obj.scale.velocity%4)throw new Error("scale.velocity must be multiple of 4");if(encode_uint8(bytes,obj.scale.velocity/4),obj.scale.acceleration%4)throw new Error("scale.acceleration must be multiple of 4");encode_uint8(bytes,obj.scale.acceleration/4)}function encode_vb_sensor_data_config_v2(bytes,obj){if(encode_device_type(bytes,obj.device_type),encode_calculation_trigger(bytes,obj.calculation_trigger),encode_uint16(bytes,obj.calculation_interval),encode_uint16(bytes,obj.fragment_message_interval),obj.threshold_window%2)throw new Error("threshold_window must be multiple of 2");for(encode_uint8(bytes,obj.threshold_window/2),idx=0;idx<5;idx++)encode_fft_trigger_threshold(bytes,obj.trigger_thresholds[idx].unit,obj.trigger_thresholds[idx].frequency,obj.trigger_thresholds[idx].magnitude);encode_fft_selection(bytes,obj.selection),encode_uint16(bytes,obj.frequency.span.velocity.start),encode_uint16(bytes,obj.frequency.span.velocity.stop),encode_uint16(bytes,obj.frequency.span.acceleration.start),encode_uint16(bytes,obj.frequency.span.acceleration.stop),encode_uint8(bytes,obj.frequency.resolution.velocity),encode_uint8(bytes,obj.frequency.resolution.acceleration),encode_sci_6(bytes,obj.scale.velocity),encode_sci_6(bytes,obj.scale.acceleration)}function encode_vb_sensor_data_config_v3(bytes,payload){if(void 0!==payload){if("vb"!=payload.device_type)throw new Error("Invalid device type!");if(encode_device_type(bytes,payload.device_type),encode_calculation_trigger(bytes,payload.calculation_trigger),encode_uint16(bytes,payload.calculation_interval),encode_uint16(bytes,payload.fragment_message_interval),payload.threshold_window%2)throw new Error("threshold_window must be multiple of 2");for(encode_uint8(bytes,payload.threshold_window/2),idx=0;idx<5;idx++)encode_fft_trigger_threshold(bytes,payload.trigger_thresholds[idx].unit,payload.trigger_thresholds[idx].frequency,payload.trigger_thresholds[idx].magnitude);encode_fft_selection(bytes,payload.selection),encode_uint16(bytes,payload.frequency.span.velocity.start),encode_uint16(bytes,payload.frequency.span.velocity.stop),encode_uint16(bytes,payload.frequency.span.acceleration.start),encode_uint16(bytes,payload.frequency.span.acceleration.stop),encode_uint8(bytes,payload.frequency.resolution.velocity),encode_uint8(bytes,payload.frequency.resolution.acceleration)}}function encode_region_config_v3(bytes,payload){if(void 0!==payload){if(encode_channel_plan_v3(bytes,payload.channel_plan),7<payload.join_trials.holdoff_steps)throw new Error("Hold off steps too large");if(31<(burst_min1=payload.join_trials.burst_count-1&255))throw new Error("Burst range 1..32");if(join_trials=255&payload.join_trials.holdoff_hours_max,encode_uint16(bytes,join_trials=(join_trials|=payload.join_trials.holdoff_steps<<8)|burst_min1<<11),0==(4095^(disable_switch=4095&payload.disable_switch.frequency_bands)))throw new Error("Not disable all bands");encode_uint16(bytes,disable_switch|=payload.disable_switch.dwell_time?4096:0),encode_uint8(bytes,15&payload.rx1_delay),adr=payload.adr.mode,encode_uint8(bytes,adr=(adr|=(7&payload.adr.ack_limit_exp)<<2)|(7&payload.adr.ack_delay_exp)<<5),encode_int8(bytes,payload.max_tx_power)}}function encode_vb_sensor_conditions_configuration_v3(bytes,payload){if(void 0!==payload){if("vb"!=payload.device_type)throw new Error("Invalid device type!");encode_device_type(bytes,payload.device_type);for(var idx=0,idx=0;idx<5;idx++){if("rms_velocity_x"==payload.event_conditions[idx].mode||"rms_velocity_y"==payload.event_conditions[idx].mode||"rms_velocity_z"==payload.event_conditions[idx].mode){if(200<=payload.event_conditions[idx].mode_value)throw new Error("mode_value is outside of specification: "+payload.event_conditions[idx].mode_value)}else if(("peak_acceleration_x"==payload.event_conditions[idx].mode||"peak_acceleration_y"==payload.event_conditions[idx].mode||"peak_acceleration_z"==payload.event_conditions[idx].mode)&&150<=payload.event_conditions[idx].mode_value)throw new Error("mode_value is outside of specification: "+payload.event_conditions[idx].mode_value);encode_event_condition_v3(bytes,payload.event_conditions[idx])}}}function encode_header(bytes,message_type_id,protocol_version){var b=0;bytes.push(b+(15&message_type_id)+((15&protocol_version)<<4))}function encode_header_v3(bytes,header){var b=0;encode_uint8(bytes,(b+=15&lookup_config_type(header.config_type))+((15&header.protocol_version)<<4))}function encode_device_type(bytes,type){switch(type){case"ts":encode_uint8(bytes,1);break;case"vs-qt":encode_uint8(bytes,2);break;case"vs-mt":encode_uint8(bytes,3);break;case"tt":encode_uint8(bytes,4);break;case"ld":encode_uint8(bytes,5);break;case"vb":encode_uint8(bytes,6);break;default:encode_uint8(bytes,0)}}function encode_event_condition_v3(bytes,event_condition){var event_condition_most_significant=0,temporary_mode=[];encode_events_mode(temporary_mode,event_condition.mode),encode_uint16(bytes,10*event_condition.mode_value|(event_condition_most_significant|=temporary_mode[0]<<12))}function encode_events_mode(bytes,mode){switch(mode){case"rms_velocity_x":encode_uint8(bytes,1);break;case"peak_acceleration_x":encode_uint8(bytes,2);break;case"rms_velocity_y":encode_uint8(bytes,3);break;case"peak_acceleration_y":encode_uint8(bytes,4);break;case"rms_velocity_z":encode_uint8(bytes,5);break;case"peak_acceleration_z":encode_uint8(bytes,6);break;case"off":encode_uint8(bytes,0);break;default:throw new Error("mode is outside of specification: "+mode)}}function encode_calculation_trigger(bytes,calculation_trigger){var calculation_trigger_bitmask=0;if("boolean"!=typeof calculation_trigger.on_event||"boolean"!=typeof calculation_trigger.on_threshold||"boolean"!=typeof calculation_trigger.on_button_press)throw new Error("calculation_trigger must contain: on_event, on_threshold and on_button_press boolean fields");encode_uint8(bytes,(calculation_trigger_bitmask|=calculation_trigger.on_event?1:0)|(calculation_trigger.on_threshold?2:0)|(calculation_trigger.on_button_press?4:0))}function encode_fft_trigger_threshold(bytes,unit,frequency,magnitude){var trigger;switch(unit){case"velocity":trigger=0;break;case"acceleration":trigger=1;break;default:throw new Error("Invalid unit")}encode_uint32(bytes,trigger=trigger|(32767&frequency)<<1|(100*magnitude&65535)<<16)}function encode_fft_selection(bytes,obj){var axis,resolution;switch(obj.axis){case"x":axis=0;break;case"y":axis=1;break;case"z":axis=2;break;default:throw new Error("selection.axis must one of 'x', 'y' or 'z'")}switch(obj.resolution){case"low_res":resolution=0;break;case"high_res":resolution=1;break;default:throw new Error("selection.resolution must one of 'low_res' or 'high_res'")}if("boolean"!=typeof obj.enable_hanning_window)throw new Error("selection.enable_hanning_window must be a boolean");encode_uint8(bytes,axis|resolution<<2|(obj.enable_hanning_window?1:0)<<3)}function encode_frequency_range(bytes,velocity,acceleration){var range=0;switch(velocity){case"range_1":range+=0;break;case"range_2":range+=1;break;default:throw new Error("Invalid velocity range!"+velocity)}switch(acceleration){case"range_1":range+=0;break;case"range_2":range+=2;break;default:throw new Error("Invalid acceleration range!"+acceleration)}encode_uint8(bytes,range)}function encode_base_config_switch(bytes,bitmask){var config_switch_mask=0;bitmask.enable_confirmed_event_message&&(config_switch_mask|=1),bitmask.enable_confirmed_data_message&&(config_switch_mask|=4),bitmask.allow_deactivation&&(config_switch_mask|=8),bytes.push(config_switch_mask&mask_byte)}function encode_base_config_switch_v3(bytes,bitmask){var config_switch_mask=0;bitmask.enable_confirmed_event_message&&(config_switch_mask|=1),bitmask.enable_confirmed_data_message&&(config_switch_mask|=2),bitmask.allow_deactivation&&(config_switch_mask|=4),bitmask.enable_debug_info&&(config_switch_mask|=8),bytes.push(config_switch_mask&mask_byte)}function encode_sensor_config_switch_mask_v3(bytes,bitmask){var config_switch_mask=0;switch(bitmask.selection){case"extended":break;case"min_only":config_switch_mask|=1;break;case"max_only":config_switch_mask|=2;break;case"avg_only":config_switch_mask|=3;break;default:throw new Error("Out of bound, selection: "+bitmask.selection)}bytes.push(config_switch_mask)}function encode_uint32(bytes,value){if(null==value)throw new Error("Variable undefined");bytes.push(value&mask_byte),bytes.push(value>>8&mask_byte),bytes.push(value>>16&mask_byte),bytes.push(value>>24&mask_byte)}function encode_int32(bytes,value){encode_uint32(bytes,value)}function encode_uint16(bytes,value){if(null==value)throw new Error("Variable undefined");bytes.push(value&mask_byte),bytes.push(value>>8&mask_byte)}function encode_int16(bytes,value){if(null==value)throw new Error("Variable undefined");encode_uint16(bytes,value)}function encode_uint8(bytes,value){if(null==value)throw new Error("Variable undefined");bytes.push(value&mask_byte)}function encode_int8(bytes,value){encode_uint8(bytes,value)}function encode_sci_6(bytes,scale){if(null==scale)throw new Error("Variable undefined");if(1<(scale_power=(scale_power=Number(scale.toExponential().split("e")[1]))<-2?-2:scale_power)&&(scale_power=1),((scale_coefficient=scale/Math.pow(10,scale_power))!=Math.floor(scale_coefficient)||scale_coefficient<1||15<scale_coefficient)&&(scale_power-=1,(scale_coefficient=scale/Math.pow(10,scale_power))<1||15<scale_coefficient||scale_power<-2||1<scale_power))throw new Error("Out of bound, scale: "+scale_power+", coefficient: "+scale_coefficient);power=(scale_power+2&3)<<4,coefficient=15&scale_coefficient,bytes.push(coefficient|power)}function calc_crc(buf){for(var T=function(){for(var c,table=new Array(256),n=0;256!=n;++n)table[c=n]=1&(c=1&(c=1&(c=1&(c=1&(c=1&(c=1&(c=1&c?-306674912^c>>>1:c>>>1)?-306674912^c>>>1:c>>>1)?-306674912^c>>>1:c>>>1)?-306674912^c>>>1:c>>>1)?-306674912^c>>>1:c>>>1)?-306674912^c>>>1:c>>>1)?-306674912^c>>>1:c>>>1)?-306674912^c>>>1:c>>>1;return"undefined"!=typeof Int32Array?new Int32Array(table):table}(),C=-1,i=(buf.length,0);i<buf.length;)C=C>>>8^T[255&(C^buf[i++])];return 65535&C}function encode_status_msg_delay_interval_v3(bytes,periodic_message_random_delay,status_message_interval){var interval_val=0;switch(status_message_interval){case"2 minutes":interval_val=0;break;case"15 minutes":interval_val=1;break;case"1 hour":interval_val=2;break;case"4 hours":interval_val=3;break;case"12 hours":interval_val=4;break;case"1 day":interval_val=5;break;case"2 days":interval_val=6;break;case"5 days":interval_val=7;break;default:throw new Error("status_message_interval is outside of specification: "+obj.status_message_interval)}bytes.push(periodic_message_random_delay|interval_val<<5)}function encode_channel_plan_v3(bytes,channel_plan){switch(channel_plan){case"EU868":bytes.push(1);break;case"US915":bytes.push(2);break;case"CN779":bytes.push(3);break;case"EU433":bytes.push(4);break;case"AU915":bytes.push(5);break;case"CN470":bytes.push(6);break;case"AS923":bytes.push(7);break;case"AS923-2":bytes.push(8);break;case"AS923-3":bytes.push(9);break;case"KR920":bytes.push(10);break;case"IN865":bytes.push(11);break;case"RU864":bytes.push(12);break;case"AS923-4":bytes.push(13);break;default:throw new Error("channel_plan outside of specification: "+obj.channel_plan)}}function lookup_config_type(config_type){switch(config_type){case"base":return 0;case"region":return 1;case"reserved":return 2;case"sensor":return 3;case"sensor_data":return 4;case"sensor_conditions":return 5;default:throw new Error("Unknown config_type: "+config_type)}}