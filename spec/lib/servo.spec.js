/*
 * Copyright 2017 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

let Servo = lib("servo");

describe("Servo", function() {
  let driver;

  beforeEach(function() {
    driver = new Servo({
      name: "servo",
      connection: { digitalWrite: spy(), servoWrite: spy(), pwmWrite: spy() },
      pin: 22
    });
  });

  describe("constructor", function() {
    it("sets @pin to the value of the passed pin", function() {
      expect(driver.pin).to.be.eql(22);
    });

    context("if no pin is specified", function() {
      it("throws an error", function() {
        let fn = function() { return new Servo({ name: "no-pin-servo" }); };
        expect(fn).to.throw("No pin specified for Servo. Cannot proceed");
      });
    });
  });

  describe("#start", function() {
    let spyCallback = spy();

    beforeEach(function(done) {
      let callback = function() {
        spyCallback();
        done();
      };
      driver.start(callback);
    });

    it("triggers the callback", function() {
      expect(spyCallback).to.be.calledOnce;
    });
  });

  describe("#halt", function() {
    let spyCallback = spy();

    beforeEach(function(done) {
      driver.start(() => {
        let callback = function() {
          spyCallback();
          done();
        };
        driver.halt(callback);
      });
    });

    it("triggers the callback", function() {
      expect(spyCallback).to.be.calledOnce;
    });
  });

  describe("#angle", function() {
    beforeEach(function(done) {
      stub(driver, "_angle");
      driver.start(function() {
        done();
      });
    });

    it("set angle of servo", function(done) {
      let rosnodejs = require("rosnodejs");
      let pub = rosnodejs.getNodeHandle().advertise("/angle_servo",
          "std_msgs/Int32", {
              queueSize: 1,
              latching: true,
              throttleMs: 1
      });
      this.pub = pub;
      const std_msgs = rosnodejs.require("std_msgs").msg;
      const msg = new std_msgs.Int32();
      msg.data = 45;
      pub.publish(msg);
      setTimeout(() => {
        expect(driver._angle).to.be.calledWith(45);
        done();
      }, 500);
    });
  });
});
