/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { Button, TextField } from '@material-ui/core';
import { Formik, Form, Field, FieldArray } from 'formik';
import styled from 'styled-components';
import Timer from './Timer';
const robot = require('robotjs');

function Text() {
  this.text = '';
  this.from = 10;
  this.to = 20;
}

function random(min, max) {
  const r = Math.round(Math.random() * min) + (max - min);
  return r > max ? max : r;
}

function randomSecond(min, max) {
  return random(min, max) * 1000;
}

function App() {
  const sending = useRef(false);
  const [sendingMessage, setSendingMessage] = useState(null);
  const [formData, setFormData] = useState(null);
  const [worker, setWorker] = useState(null);

  useEffect(() => {
    setWorker(new Worker('./auto.worker.js', { type: 'module' }));
  }, []);

  useEffect(() => {
    if (!worker) return;

    worker.onmessage = e => {
      const { type, data } = e.data;
      let timeout = null;
      switch (type) {
        case 'next-message': {
          setSendingMessage(data);
          timeout = setTimeout(() => {
            // Type "Hello World".
            robot.moveMouse(100, 100);
            robot.typeString('Hello World');

            // Press enter.
            robot.keyTap('enter');
            worker.postMessage({
              type: 'next'
            });
          }, data.time);
          break;
        }
        case 'stop':
          clearTimeout(timeout);
          break;
        default:
          break;
      }
    };
  }, [worker]);

  useEffect(() => {
    if (formData) {
      // build msg & time
      const msgs = formData.texts.map(text => ({
        text: text.text,
        time: randomSecond(text.from, text.to)
      }));

      worker.postMessage({
        type: 'messages',
        data: msgs
      });

      worker.postMessage({
        type: 'next'
      });
    }
  }, [sending, formData]);

  return (
    <Formik
      initialValues={{
        texts: [new Text()]
      }}
      onSubmit={values => {
        if (sending.current) {
          sending.current = false;
          setFormData(null);
          setSendingMessage(null);
          worker.postMessage({
            type: 'stop'
          });
        } else {
          sending.current = true;
          setFormData(values);
        }
      }}
      render={({ values }) => (
        <Form
          style={{
            padding: 10
          }}
        >
          <div>
            <FieldArray
              name="texts"
              render={arrayHelpers => (
                <div>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => arrayHelpers.push(new Text())}
                  >
                    add text
                  </Button>

                  {values.texts.map((text, index) => (
                    <TextRow key={index}>
                      <Field
                        style={{
                          flex: 1
                        }}
                        label={`Text ${index + 1}`}
                        name={`texts.${index}.text`}
                        as={TextField}
                        placeholder="Please enter your text here"
                      />
                      &nbsp;
                      <Field
                        label="From"
                        name={`texts.${index}.from`}
                        render={({ field }) => (
                          <label>
                            Delay from: &nbsp;
                            <input
                              {...field}
                              type="number"
                              min={0}
                              max={text.to}
                            />
                          </label>
                        )}
                      />
                      &nbsp;
                      <Field
                        label="From"
                        name={`texts.${index}.to`}
                        render={({ field }) => (
                          <label>
                            To: &nbsp;
                            <input
                              {...field}
                              type="number"
                              min={text.from}
                              max={1000}
                            />
                          </label>
                        )}
                      />
                      &nbsp;
                      <button
                        onClick={() => arrayHelpers.remove(index)}
                        disabled={values.texts.length === 1}
                      >
                        Remove
                      </button>
                    </TextRow>
                  ))}
                </div>
              )}
            />
            <h4>&nbsp;</h4>
            <Button
              color="secondary"
              variant="contained"
              style={{ marginTop: 30 }}
              type="submit"
            >
              {sending.current ? 'stop' : 'start'}
            </Button>
            {sendingMessage && (
              <h4>
                <code>
                  <Gray>Sending text</Gray> {sendingMessage.text} &nbsp;
                  <Gray>in</Gray> &nbsp;
                  <Timer key={sendingMessage.id} second={sendingMessage.time} />
                  &nbsp; <Gray>second.</Gray>
                </code>
              </h4>
            )}
          </div>
        </Form>
      )}
    />
  );
}

const Gray = styled.span`
  color: #0d90d3;
`;

const TextRow = styled.div`
  display: flex;
  align-items: flex-end;
  margin: 10px 0;
`;

export default App;
