# TensorFlow.js API Reference

This document is the developer reference for the TensorFlow.js (TF.js) surface
exercised by the NeuralLab V1 labs. It is derived from the `tfjsApi` fields in
`src/app/educational-content/concepts/concepts.ts`, from the lab configs in
`src/app/educational-content/lab-configs/`, and from the experiment
implementations in `src/app/features/labs/**/*.experiments.ts`. APIs that are
only named by concept metadata (and not executed by a lab experiment) are
marked as such.

> Lab links below point to the per-lab pages in [`docs/labs/`](labs/README.md).
> The maths behind these operations lives in
> [mathematical-concepts.md](mathematical-concepts.md).

## How tensors are created

### `tf.tensor(values, shape?, dtype?)`
Creates a tensor from a flat (or nested) array. When `shape` is omitted it is
inferred; `dtype` defaults to `'float32'` for number arrays. The product of
`shape` must equal the number of values. Used in Lab 1 (`lab-01-create-tensor`)
and in many code snippets.

```ts
const t = tf.tensor([22, 23, 25, 24, 26, 27], [2, 3], 'float32');
t.shape; // [2, 3]
```

### `tf.tensor1d(values, dtype?)`, `tf.tensor2d(values, shape, dtype?)`, `tf.tensor3d(values, shape, dtype?)`
Rank-1/2/3 constructors. `tensor2d`/`tensor3d` accept either nested arrays or a
flat array plus an explicit shape. Used throughout (Labs 3–15); `tensor3d` is the
DOM-free image fallback in Lab 15 (`TENSOR3D_CODE`).

```ts
const v = tf.tensor1d([2, 0.5, 3, 4]);
const m = tf.tensor2d([[2, 3, 1, 1], [4, 0, 2, 0.5], [1, 1, 0.5, 2]]);
const img = tf.tensor3d(rgbValues(image), [image.height, image.width, 3], 'float32');
```

### `tf.scalar(value, dtype?)`
A rank-0 tensor (`shape []`). Used in Lab 11 snippets for the bias and in
Lab 12 for sampling a single activation value.

```ts
const b = tf.scalar(-1);
```

### Tensor properties and methods
| Member | Meaning |
| --- | --- |
| `tensor.shape` | Array with the size of every axis. |
| `tensor.rank` | Number of dimensions (`shape.length`). |
| `tensor.size` | Total number of elements. |
| `tensor.dtype` | `'float32'`, `'int32'`, `'bool'`, … |
| `tensor.print()` | Prints shape + values to the console. |
| `tensor.dispose()` | Releases this tensor's memory immediately. |
| `tensor.isDisposed` | Whether the tensor has already been disposed. |

Used in Lab 1 (shape/rank/size/dtype) and Labs 2–16 (disposal).

## Shape manipulation

### `tf.reshape(tensor, shape)`
Returns a tensor with a new shape; the total number of elements (`size`) must be
preserved. A single `-1` lets TF.js infer that dimension. Used in Lab 2
(`lab-02-reshape`) and, as `tf.reshape(t, [-1])`, for flattening.

```ts
tf.reshape(t, [3, 2]).print();  // [3, 2]
tf.reshape(t, [-1]).print();    // [6]  (flatten)
```

### `tf.expandDims(tensor, axis)`
Inserts a size-1 axis at `axis`, increasing the rank by one. Used in Lab 2 and in
Lab 6 to turn a `[3]` correction vector into `[3, 1]` for broadcasting.

```ts
tf.expandDims(t, 0).print();                      // [1, 2, 3]
tf.expandDims(tf.tensor1d([1, 2, 3]), 1);         // [3, 1]
```

### `tf.squeeze(tensor, axis?)`
Removes size-1 axes, reducing the rank without changing values. Squeezing an axis
whose size is not 1 is an error (Lab 2 falls back to flatten in that case).

```ts
tf.squeeze(tf.expandDims(t, 0)).print(); // back to [2, 3]
```

## Element-wise arithmetic and broadcasting

### `tf.add`, `tf.sub`, `tf.mul`, `tf.div`, `tf.pow`, `tf.sqrt`, `tf.square`
Apply an operation position by position and return a result of the broadcast
shape. Binary ops (`add`, `sub`, `mul`, `div`, `pow`) take two operands; `sqrt`
and `square` take one. Used in Lab 3 (`lab-03-elementwise`) and in the
regression/neuron code of Labs 9–11.

```ts
const custos = tf.mul(quantidades, precos);       // [3, 4] × [4] → [3, 4]
const totais = tf.sum(custos, 1);                 // [3]
const raiz = tf.sqrt(quantidades);
const mse = tf.mean(tf.square(tf.sub(predictions, ys)));
```

### `tf.broadcastTo(tensor, shape)`
Explicitly expands a tensor to a larger compatible shape. Referenced by the
`broadcasting` concept; the labs rely on implicit broadcasting rather than
calling `broadcastTo` directly.

```ts
tf.broadcastTo(tf.tensor1d([1, 2, 3]), [2, 3]);
```

Broadcasting rules (right-aligned, equal or 1) are explained in
[mathematical-concepts.md](mathematical-concepts.md#broadcasting) and exercised
in [Lab 3](labs/03-operacoes-elemento-a-elemento.md) and
[Lab 6](labs/06-broadcasting.md).

## Reductions

### `tf.sum`, `tf.mean`, `tf.min`, `tf.max`
Reduce a tensor along `axis` (or over all elements when `axis` is omitted).
`keepDims` keeps the reduced axis as size 1. Used in Lab 4
(`lab-04-reductions`) and Lab 15 for grayscale.

```ts
tf.mean(t, 0).print();  // [7]  one value per day
tf.max(t, 1).print();   // [3]  one value per city
// Grayscale: luminance summed over the channel axis, keeping rank 3.
tf.sum(tf.mul(pixels, [0.299, 0.587, 0.114]), 2, true); // [h, w, 1]
```

## Matrix operations

### `tf.transpose(tensor, perm?)`
Permutes the axes. For a matrix it swaps rows and columns. Used in Lab 5
(`lab-05-matrix`) and Lab 2's challenge (axis permutation).

```ts
tf.transpose(quantidades).print(); // [3, 5] → [5, 3]
```

### `tf.matMul(a, b)`
Matrix product `[m, n] × [n, p] = [m, p]`; incompatible inner dimensions throw.
Each output element is the dot product of a row of `a` with a column of `b`.
This is the core operation of a dense layer. Used in Labs 5, 7 and 11–14.

```ts
const receita = tf.matMul(quantidades, precos); // [3, 5] × [5, 1] → [3, 1]
const transformados = tf.matMul(pontos, M);      // [5, 2] × [2, 2] → [5, 2]
```

### `tf.dot(a, b)`
Dot product of two vectors, returning a scalar. Used in Lab 7
(`lab-07-linear-transform`).

```ts
tf.dot(tf.tensor1d([1, 0]), tf.tensor1d([0, 1])); // 0
```

## Activation functions

### `tf.sigmoid`, `tf.relu`, `tf.tanh`, `tf.softmax`
Element-wise activations. `softmax` operates on a vector (or last axis) and
returns a probability distribution that sums to 1. Used in Lab 11 (sigmoid
neuron) and Lab 12 (`lab-12-activation`).

```ts
const z = tf.tensor1d([-2, -1, 0, 1, 2]);
tf.sigmoid(z).print();
tf.relu(z).print();
tf.tanh(z).print();
tf.softmax(z).print(); // sums to 1
```

Formulas and derivatives are in
[mathematical-concepts.md](mathematical-concepts.md#activation-functions-and-derivatives).

## Classification utilities

### `tf.argMax(x, axis)`
Index of the maximum value along `axis`; used to turn class probabilities into a
predicted class. The `classificacao` concept references it, and Lab 14's snippet
uses it for the confusion matrix.

```ts
const predicted = tf.argMax(probabilities, 1);
```

### `tf.oneHot(indices, depth, onValue?, offValue?)`
Encodes class indices as one-hot vectors. Used in Lab 14 for multiclass labels.

```ts
const oneHot = tf.oneHot(labels, numClasses); // classe 1 de 3 → [0, 1, 0]
```

### `tf.metrics.categoricalAccuracy`
Built-in metric for one-hot multiclass accuracy; referenced by the
`classificacao` concept (training metrics in the labs are computed by the
training worker / pure helpers instead).

## Layers and model API

The code-view stages of Labs 11, 13 and 14 show the high-level `tf.layers` /
`tf.sequential` API. The labs' actual training runs in a Web Worker using the
pure-JS implementation in `src/app/core/utils/neural-network.ts` (forward pass,
cross-entropy, backpropagation, weight updates) — see the
[development guide](development-guide.md) for that split.

### `tf.sequential(config?)` and `model.add(layer)`
Builds a feed-forward stack of layers.

```ts
const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [2], units: 8, activation: 'tanh' }));
model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
```

### `tf.layers.dense({ units, activation, inputShape? })`
A fully-connected layer; `units` is the number of neurons and `activation` one
of `'sigmoid' | 'relu' | 'tanh' | 'softmax' | 'linear'`. A single-unit sigmoid
dense layer is equivalent to the Lab 11 neuron.

### `model.compile({ optimizer, loss, metrics? })`
Configures loss and optimizer before training.

```ts
model.compile({
  optimizer: tf.train.sgd(0.5),
  loss: 'binaryCrossentropy',
  metrics: ['accuracy'],
});
```

### `model.fit(x, y, { epochs, batchSize?, shuffle? })`
Runs forward + loss + backpropagation + weight updates for each epoch and
returns a history of metrics.

```ts
await model.fit(xs, ys, { epochs: 120, batchSize: 32, shuffle: true });
```

### `model.predict(x)` and `model.evaluate(x, y)`
Forward pass used for inference / metrics. Both are referenced by concepts
(`forward-propagation`, `predicao`, `fronteira-de-decisao`).

## Autodifferentiation, variables and optimizers

These APIs are taught in the regression/gradient-descent code snippets and are
named by concept metadata. The shipped Lab 10 training uses the analytic MSE
gradients in `src/app/core/utils/regression.ts`; the snippets show the TF.js
equivalents.

### `tf.variable(initialValue, trainable?, name?)`
A mutable tensor whose values the optimizer updates.

### `tf.grad(f)` and `tf.variableGrads(f)`
`tf.grad` returns the gradient of a scalar function with respect to its input;
`tf.variableGrads` returns the value plus the gradients of every `tf.variable`
used, keyed by name.

```ts
for (let epoch = 0; epoch < 40; epoch++) {
  const { value, grads } = tf.variableGrads(() => {
    const errors = tf.sub(tf.add(tf.mul(xs, w), b), ys);
    return tf.mean(tf.square(errors));
  });
  w -= lr * grads['w'].dataSync()[0];
  b -= lr * grads['b'].dataSync()[0];
  tf.dispose([value, grads['w'], grads['b']]);
}
```

### `tf.train.sgd(lr)`, `tf.train.momentum(lr, momentum)`, `tf.train.adam(lr?)`
Optimizers. `optimizer.minimize(f)` computes gradients and applies one update;
`optimizer.applyGradients(grads)` applies already-computed gradients. Referenced
by the `learning-rate`, `minimo-local` and `treino` concepts.

```ts
const optimizer = tf.train.sgd(0.003);
optimizer.minimize(() => tf.mean(tf.square(errors)));
```

### `tf.losses.meanSquaredError` and `tf.losses.softmaxCrossEntropy`
Built-in loss functions referenced by the `loss` and `mse` concepts. Labs 9 and
10 compute the MSE directly from `tf.mean(tf.square(...))`.

## Memory management

### `tf.tidy(fn)`
Runs `fn` and disposes every tensor it creates except the returned value. The
safest default for intermediate computations. Used in Labs 6, 9, 10, 12, 15 and
16, and wrapped by the project's `TfjsMemoryService.tidy()`.

```ts
const mse = tf.tidy(() => {
  const predictions = tf.add(tf.mul(xs, w), b);
  const errors = tf.sub(predictions, ys);
  return tf.mean(tf.square(errors));
});
```

### `tensor.dispose()` and `tf.dispose(container)`
`dispose()` frees one tensor; `tf.dispose` frees every tensor in a nested
container (array/object). Needed for long-lived tensors created outside `tidy`.
Used in Labs 1–16 code snippets and Lab 16 (`lab-16-memory`).

```ts
tf.dispose([predictions, errors]);
```

### `tf.memory()`
Reports current TF.js memory: `numTensors`, `numBytes`, `numDataBuffers` and
`unreliable`. The `TfjsMemoryService` maps this to `usedMemoryMB`/`peakMemoryMB`.
Used in Lab 16.

```ts
const antes = tf.memory().numTensors;
// ... create tensors ...
console.log(tf.memory().numTensors - antes);
```

### `tf.disposeVariables()`
Disposes every `tf.variable`. Exposed by `TfjsMemoryService.disposeAll(false)`
and referenced by the `memoria`/`dispose` concepts.

## Images and pixels

### `tf.browser.fromPixels(pixels, numChannels?)`
Builds a rank-3 image tensor from an image element or `ImageData`. In Lab 15 the
browser path is `tf.browser.fromPixels(image).toFloat()`, producing
`[height, width, 3]` float32 values in `[0, 255]`. When no DOM is available
(jsdom), the lab falls back to `tf.tensor3d`.

```ts
const pixels = tf.browser.fromPixels(image).toFloat(); // [h, w, 3]
```

### `tf.image.resizeBilinear(images, [newHeight, newWidth])`
Bilinearly resizes image tensors. Used in Lab 15 to reach a `size × size` input
(e.g. `[224, 224]` for MobileNet).

```ts
const resized = tf.image.resizeBilinear(pixels, [224, 224]);
```

### `tf.split(tensor, numOrSizeSplits, axis)`
Splits a tensor along an axis; referenced by the `rgb` concept for channel
separation.

## Data loading

### `tf.data.csv(source, config?)`
Streams CSV rows into tensors; referenced by the `dataset` concept. The V1 labs
ship their datasets inline (`lab-08`'s `HOUSING_DATASET`, `lab-09`/`lab-10`'s
regression points) rather than loading CSV.

## Dtypes and shapes

- **`float32`** — default for learning; accepts decimals. Used by every lab's
  numeric tensors.
- **`int32`** — used for pixel indices (`tf.browser.fromPixels` returns int32
  before `.toFloat()`) and for integer labels; selectable in Lab 1.
- **shape** — `number[]` with the size of each axis, read "outside in"
  (e.g. `[3, 7]` = 3 rows × 7 columns).
- **rank** — `shape.length`; scalar 0, vector 1, matrix 2, image 3.
- **size** — product of the shape (`∏ dᵢ`).

See [math: tensors](mathematical-concepts.md#tensors-rank-shape-and-index-notation)
and [Lab 1](labs/01-fundamentos-de-tensores.md).

## API index by lab

| API | Used / referenced in |
| --- | --- |
| `tf.tensor`, `tf.tensor1d/2d/3d`, `tf.scalar` | 1, 3–15 |
| `tensor.shape/rank/size/dtype/print/dispose` | 1–16 |
| `tf.reshape`, `tf.expandDims`, `tf.squeeze` | 2, 6 |
| `tf.add/sub/mul/div/pow/sqrt/square` | 3, 6, 9, 10, 15 |
| `tf.broadcastTo` | 3, 6 (concept) |
| `tf.sum/mean/min/max` | 3, 4, 8, 9, 15 |
| `tf.transpose`, `tf.matMul`, `tf.dot` | 2, 5, 7, 11–14 |
| `tf.sigmoid/relu/tanh/softmax` | 11, 12, 14 |
| `tf.argMax`, `tf.oneHot`, `tf.metrics.categoricalAccuracy` | 14 (concept/snippet) |
| `tf.layers.dense`, `tf.sequential`, `model.compile/fit/predict/evaluate` | 11, 13, 14 (snippets) |
| `tf.grad`, `tf.variableGrads`, `tf.variable`, `tf.train.*`, `optimizer.*`, `tf.losses.*` | 9, 10, 13 (concept/snippets) |
| `tf.tidy`, `tf.dispose`, `tf.disposeVariables`, `tf.memory` | 6, 9, 10, 12, 15, 16 |
| `tf.browser.fromPixels`, `tf.image.resizeBilinear`, `tf.tensor3d` | 15 |
| `tf.data.csv` | 8 (concept) |
