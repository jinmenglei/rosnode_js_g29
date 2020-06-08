#!/usr/bin/env node

'use strict';

const rosnodejs = require('rosnodejs');
const g = require('logitech-g29');

const Twist = rosnodejs.require('geometry_msgs').msg.Twist;
const std_msgs = rosnodejs.require('std_msgs').msg;

const options = {
    autocenter: true,
    debug: false,
    range: 900
}

const wheel = {
    currentPos: 0,
    moveToPos: 0,
    moved: true
}

var connected = false;
var shifter = 1;
var is_brake =false;
// once g29 is connected, run this function
g.connect(options, function() {
    connected = true;
    g.forceFriction(0.4);
})

function g29_pub_node() {
    rosnodejs.initNode('/g29_pub')
        .then((rosNode) => {
            console.log("init node ok");
            if (!connected)
                return;
            var pub = rosNode.advertise('/cmd_vel', Twist);
            var pub_ctrl = rosNode.advertise('/g29_ctrl', std_msgs.String);
            const msg = new Twist();
            const ctrl_msg = new std_msgs.String();
            g.on('wheel-turn', function(val){
                if (is_brake){
                    return;
                }
                msg.angular.z = -(val-50.0)/20.0;    //# 可以按照实际需要，将 g29 转角转换成小车的转角
                pub.publish(msg);
            })
            g.on('pedals-gas', function(val){
                if (is_brake) {
                    return;
                }
                msg.linear.x = val * 2 * shifter;  //# 可根据需要修改
                pub.publish(msg);
            })
            g.on('pedals-brake', function(val){
                // console.log(val);
                if (val !== 0) {
                    is_brake=true;
                }else {
                    is_brake=false;
                }
                msg.linear.x = 0;   //# 可根据需要修改
                msg.linear.z = 0;
                pub.publish(msg);
            })
            g.on('pedals-clutch', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
            })
            g.on('pedals-clutch', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                ctrl_msg.data = "realse";
                pub_ctrl.publish(ctrl_msg);
            })
            g.on('wheel-spinner', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                if (val === -1)
                    ctrl_msg.data = "camera_turn_left";
                else if (val === 1)
                    ctrl_msg.data = "camera_turn_right";
                if (val !== 0)
                    pub_ctrl.publish(ctrl_msg)
            })
            g.on('wheel-button_spinner', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                if (val === 1)
                    ctrl_msg.data = "camera_turn_zero";
                if (val !== 0)
                    pub_ctrl.publish(ctrl_msg)
            })
            g.on('wheel-button_plus', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                if (val === 1)
                    ctrl_msg.data = "camera_turn_plus";
                if (val !== 0)
                    pub_ctrl.publish(ctrl_msg);
            })
            g.on('wheel-button_minus', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                if (val === 1)
                    ctrl_msg.data = "camera_turn_minus";
                if (val !== 0)
                    pub_ctrl.publish(ctrl_msg);
            })
            g.on('wheel-button_x', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                if (val === 1)
                    ctrl_msg.data = "camera_turn_down";
                if (val !== 0)
                    pub_ctrl.publish(ctrl_msg);
            })
            g.on('wheel-button_triangle', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                if (val === 1)
                    ctrl_msg.data = "camera_turn_up";
                if (val !== 0)
                    pub_ctrl.publish(ctrl_msg);
            })
            g.on('wheel-shift_left', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                if (val === 1)
                    ctrl_msg.data = "camera_mode_release";
                if (val !== 0)
                    pub_ctrl.publish(ctrl_msg);
            })
            g.on('wheel-shift_right', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                if (val === 1)
                    ctrl_msg.data = "camera_mode_start";
                if (val !== 0)
                    pub_ctrl.publish(ctrl_msg);
            })
            g.on('wheel-dpad', function(val){
                // msg.linear.x = val * - 5;   //# 可根据需要修改
                // pub.publish(msg);
                // 1 = north
                // 2 = northeast
                // 3 = east
                // 4 = southeast
                // 5 = south
                // 6 = southwest
                // 7 = west
                // 8 = northwest
                if (val === 1)
                    ctrl_msg.data = "camera_turn_north";
                else if (val === 2)
                    ctrl_msg.data = "camera_turn_northeast";
                else if (val === 3)
                    ctrl_msg.data = "camera_turn_east";
                else if (val === 4)
                    ctrl_msg.data = "camera_turn_southeast";
                else if (val === 5)
                    ctrl_msg.data = "camera_turn_south";
                else if (val === 6)
                    ctrl_msg.data = "camera_turn_southwest";
                else if (val === 7)
                    ctrl_msg.data = "camera_turn_west";
                else if (val === 8)
                    ctrl_msg.data = "camera_turn_northwest";
                if (val !== 0)
                    pub_ctrl.publish(ctrl_msg);
            })
            g.on('shifter-gear', function(val){
                msg.linear.y = val;   //# 可根据需要修改
                if (val === -1)
                    shifter = -1;
                else
                    shifter = 1;
                // pub.publish(msg);
            })
        })
}


if (require.main === module) {
    // Invoke Main Function
    g29_pub_node();
}