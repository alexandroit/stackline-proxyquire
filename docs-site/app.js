'use strict';

(() => {
  const defaults = {
    request: './mailer',
    original: '{\n  "send": "original send",\n  "format": "original format"\n}',
    stub: '{\n  "send": "stubbed send"\n}',
    scope: 'local'
  };
  const request = document.querySelector('#request');
  const original = document.querySelector('#original-exports');
  const stub = document.querySelector('#stub-exports');
  const noCallThru = document.querySelector('#no-call-thru');
  const scope = document.querySelector('#scope');
  const title = document.querySelector('#result-title');
  const detail = document.querySelector('#result-detail');
  const scopeDetail = document.querySelector('#scope-detail');
  const indicator = document.querySelector('#status-indicator');
  const output = document.querySelector('#resolved-output');

  document.querySelector('#evaluate-button').addEventListener('click', evaluateStubs);
  document.querySelector('#reset-button').addEventListener('click', () => {
    request.value = defaults.request;
    original.value = defaults.original;
    stub.value = defaults.stub;
    scope.value = defaults.scope;
    noCallThru.checked = false;
    evaluateStubs();
  });
  for (const element of [request, original, stub, noCallThru, scope]) {
    element.addEventListener('input', evaluateStubs);
    element.addEventListener('change', evaluateStubs);
  }
  for (const button of document.querySelectorAll('[data-copy]')) {
    button.addEventListener('click', async () => {
      const target = document.querySelector(button.dataset.copy);
      const value = target ? target.textContent.trim() : '';
      await navigator.clipboard.writeText(value);
      const previous = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = previous; }, 1200);
    });
  }

  function evaluateStubs() {
    try {
      if (!request.value.trim()) throw new Error('Dependency request cannot be empty.');
      const originalValue = JSON.parse(original.value);
      const stubValue = JSON.parse(stub.value);

      if (stubValue === null) {
        show(true, 'Missing module simulated', `${request.value.trim()} would throw a MODULE_NOT_FOUND error.`);
        output.textContent = 'MODULE_NOT_FOUND';
        updateScope();
        return;
      }

      const canFill = isRecord(originalValue) && isRecord(stubValue);
      const resolved = canFill && !noCallThru.checked
        ? copyOwn(originalValue, stubValue)
        : stubValue;
      const filled = canFill && !noCallThru.checked
        ? Object.keys(originalValue).filter((key) => !Object.prototype.hasOwnProperty.call(stubValue, key))
        : [];

      output.textContent = JSON.stringify(resolved, null, 2);
      if (noCallThru.checked) {
        show(true, 'Strict stub returned', 'Call-through is disabled; only the provided stub is visible.');
      } else if (!canFill) {
        show(true, 'Non-object stub returned', 'Call-through filling applies only when both values expose properties.');
      } else if (filled.length > 0) {
        show(true, 'Call-through fills omitted properties', `Inherited from the original dependency: ${filled.join(', ')}.`);
      } else {
        show(true, 'Stub is complete', 'No original dependency properties need to be filled.');
      }
      updateScope();
    } catch (error) {
      show(false, 'Configuration rejected', error.message);
      output.textContent = 'Fix the request or JSON input to continue.';
    }
  }

  function copyOwn(originalValue, stubValue) {
    const result = Object.create(null);
    for (const [key, value] of Object.entries(originalValue)) result[key] = value;
    for (const [key, value] of Object.entries(stubValue)) result[key] = value;
    return result;
  }

  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function updateScope() {
    const messages = {
      local: "Local stubs apply to the subject's matching require.",
      global: '@global stubs can apply transitively during module initialization.',
      runtime: '@runtimeGlobal stubs also apply to later CommonJS require calls.'
    };
    scopeDetail.textContent = messages[scope.value];
  }

  function show(valid, heading, message) {
    title.textContent = heading;
    detail.textContent = message;
    indicator.classList.toggle('error', !valid);
  }

  evaluateStubs();
})();
