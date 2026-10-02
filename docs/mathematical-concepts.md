# Mathematical Concepts

Developer reference for the mathematics behind the NeuralLab V1 labs. Every
formula below is derived from the concept definitions in
`src/app/educational-content/concepts/concepts.ts` and from the pure helpers in
`src/app/core/utils/regression.ts`, `src/app/core/utils/neural-network.ts` and
`src/app/core/images/image-tensor.ts`. Lab links point to the per-lab pages in
[`docs/labs/`](labs/README.md); the TF.js equivalents are in
[tensorflow-concepts.md](tensorflow-concepts.md).

## Tensors, rank, shape and index notation

A tensor of rank $n$ is an array indexed by $n$ coordinates:

$$
T \in \mathbb{R}^{d_1 \times d_2 \times \cdots \times d_n}, \qquad
T_{i_1 i_2 \ldots i_n}.
$$

- **rank** — number of axes, $\operatorname{rank}(T) = \operatorname{shape}(T).\text{length}$.
- **shape** — the tuple $(d_1, d_2, \ldots, d_n)$.
- **size** — total number of elements, $\text{size} = \prod_i d_i$.
- **scalar** $x \in \mathbb{R}$ (rank 0), **vector** $\mathbf{v} \in \mathbb{R}^{n}$
  (rank 1), **matrix** $M \in \mathbb{R}^{m \times n}$ (rank 2).

The shape is read "outside in": a flat array `[1, 2, 3, 4, 5, 6]` under shape
`[2, 3]` has row 0 = `[1, 2, 3]` and `T[0][1] = 2`. `reshape` preserves the
size and only changes the stride layout; `flatten` is the special case
`tf.reshape(t, [-1])`. Uses of rank/shape in [Lab 1](labs/01-fundamentos-de-tensores.md)
and [Lab 2](labs/02-manipulacao-de-tensores.md).

## Element-wise operations

Element-wise (Hadamard) products and sums combine position by position:

$$
(A \odot B)_{ij} = A_{ij} \cdot B_{ij}, \qquad (A + B)_{ij} = A_{ij} + B_{ij}.
$$

Binary operators used by the labs: `add`, `sub`, `mul`, `div`, `pow`; unary:
`sqrt`, `square`. [Lab 3](labs/03-operacoes-elemento-a-elemento.md).

### Broadcasting

Shapes are aligned **from the right**; two dimensions are compatible when they
are equal or one of them is 1, and a size-1 dimension is stretched:

$$
[3, 7] \;\text{op}\; [7] \;\to\; [3, 7], \qquad
[3, 7] \;\text{op}\; [3, 1] \;\to\; [3, 7].
$$

A scalar has shape `[]` and expands to any shape, e.g.
`celsius [4] × 1.8 + 32 → [4]`. Incompatible pairs (e.g. `[2, 3]` with `[3, 2]`)
raise a shape error. Implemented in `broadcastShape` and used in
[Lab 3](labs/03-operacoes-elemento-a-elemento.md) and
[Lab 6](labs/06-broadcasting.md).

## Reductions and axis

A reduction collapses one or more axes:

$$
\operatorname{sum}(T)_{j} = \sum_i T_{ij} \quad (\text{axis}=0), \qquad
\operatorname{mean}(T)_{i} = \frac{1}{n}\sum_j T_{ij} \quad (\text{axis}=1).
$$

- `axis = 0` combines the **rows** (one value per column).
- `axis = 1` (or `-1`, the last axis) combines the **columns**.
- Without `axis`, all elements reduce to a scalar.

The mean is $\bar{x} = \frac{1}{n}\sum_i x_i$; hand-checked in
[Lab 4](labs/04-operacoes-de-reducao.md), whose challenge also relies on the
variance $\operatorname{Var}(x) = \frac{1}{n}\sum_i (x_i - \bar{x})^2$.

## Dot product and matrix product

The dot product of two equal-length vectors is a scalar measuring alignment:

$$
\mathbf{a} \cdot \mathbf{b} = \sum_i a_i b_i.
$$

$\mathbf{a}\cdot\mathbf{b}=0$ means the vectors are perpendicular. The matrix
product generalises this: element $(i,j)$ of $C = AB$ is the dot product of row
$i$ of $A$ with column $j$ of $B$,

$$
C_{ij} = \sum_k A_{ik} B_{kj},
\qquad
[m, n] \times [n, p] = [m, p].
$$

The shared inner dimension $n$ must match; `transpose` swaps rows and columns
($A^{T}_{ij} = A_{ji}$) to align shapes. [Lab 5](labs/05-operacoes-matriciais.md),
[Lab 7](labs/07-algebra-linear-aplicada.md).

## Linear transformations and rotation matrices

A matrix maps vectors linearly: $\mathbf{y} = M\mathbf{x}$ — a rotation, scale,
shear, reflection or projection. A dense layer applies the same idea to a batch.

In Lab 7 the points are stored as **rows**, so the row-vector convention
$\mathbf{p}' = \mathbf{p}\,M$ matches `tf.matMul(points, M)`. For a rotation by
$\theta$ composed with a uniform scale $s$:

$$
M = \begin{bmatrix} s\cos\theta & s\sin\theta \\ -s\sin\theta & s\cos\theta \end{bmatrix},
\qquad M = \begin{bmatrix} 0 & 1 \\ -1 & 0 \end{bmatrix} \text{ for } \theta = 90^\circ, s = 1.
$$

The determinant $\det M = s^2$ is the area scaling factor.
[Lab 7](labs/07-algebra-linear-aplicada.md).

## Datasets, features, labels and splits

A supervised dataset is a set of examples with features $\mathbf{x}$ and label
$y$:

$$
\mathcal{D} = \{(\mathbf{x}_i, y_i)\}_{i=1}^{n}, \qquad
\mathbf{x} \in \mathbb{R}^{d}, \quad y \in \mathbb{R} \text{ or } y \in \{1, \ldots, K\}.
$$

Features are stored as a matrix `[samples, features]` and labels as a vector.
The dataset is split into **training** (fit the parameters) and
**validation/test** (measure generalisation). Feature/label strength is measured
with the Pearson correlation

$$
r = \frac{\sum_i (x_i - \bar{x})(y_i - \bar{y})}
         {\sqrt{\sum_i (x_i-\bar{x})^2}\sqrt{\sum_i (y_i-\bar{y})^2}}.
$$

Implemented in `pearsonCorrelation`; used in
[Lab 8](labs/08-fundamentos-de-machine-learning.md).

**Epoch and batch.** An epoch is one full pass over the training set; with batch
size $B$ there are $\lceil n/B \rceil$ update steps per epoch. Mini-batch
gradient descent updates after each batch. [Lab 8](labs/08-fundamentos-de-machine-learning.md).

## Linear regression and MSE

Linear regression predicts a continuous value with a line:

$$
\hat{y} = w x + b,
$$

where $w$ is the slope and $b$ the intercept. The fit minimises the mean squared
error over the data:

$$
\text{MSE}(w, b) = \frac{1}{n}\sum_i (\hat{y}_i - y_i)^2
= \frac{1}{n}\sum_i (w x_i + b - y_i)^2.
$$

The residuals are $e_i = \hat{y}_i - y_i$. Squaring penalises large errors and
makes the cost a smooth (convex) function of $w$ and $b$. Lab 9's dataset has
the exact least-squares fit $w = 2$, $b = 1$, giving $\text{MSE} = 0.8$.
Implemented in `meanSquaredError`; [Lab 9](labs/09-regressao-linear.md).

## Gradient and gradient descent

The gradient collects the partial derivatives of the loss with respect to each
parameter and points in the direction of steepest **increase**:

$$
\nabla_\theta J = \left[\frac{\partial J}{\partial \theta_1}, \ldots, \frac{\partial J}{\partial \theta_k}\right].
$$

For the linear model:

$$
\frac{\partial \text{MSE}}{\partial w} = \frac{2}{n}\sum_i (\hat{y}_i - y_i)\,x_i,
\qquad
\frac{\partial \text{MSE}}{\partial b} = \frac{2}{n}\sum_i (\hat{y}_i - y_i).
$$

Gradient descent steps in the opposite direction with learning rate $\eta$:

$$
\theta \leftarrow \theta - \eta \nabla_\theta J(\theta),
\qquad
w \leftarrow w - \eta \frac{\partial \text{MSE}}{\partial w},
\quad
b \leftarrow b - \eta \frac{\partial \text{MSE}}{\partial b}.
$$

- **Convergence** — the loss stops decreasing, $\lVert\nabla_\theta J\rVert \to 0$.
- **Divergence** — the loss grows without bound (or reaches `Infinity`) when
  $\eta$ is too large for the curvature.
- **Local minimum** — a valley that is not the global minimum; the MSE bowl is
  convex, so it has a single global minimum.

Implemented in `mseGradients` and `gradientDescentRun`; analytic MSE gradients
are exercised in [Lab 9](labs/09-regressao-linear.md) and
[Lab 10](labs/10-descida-do-gradiente.md).

## The artificial neuron

A neuron computes a weighted sum plus a bias, then applies an activation:

$$
z = \sum_i w_i x_i + b = \mathbf{w}\cdot\mathbf{x} + b,
\qquad
a = f(z).
$$

$z$ is the weighted sum, $a$ the activation (output). With two inputs the
decision boundary $z = 0$ is the line $w_1 x_1 + w_2 x_2 + b = 0$.
Implemented in `weightedSum` / `neuronForward` / `decisionLine`;
[Lab 11](labs/11-o-neuronio.md).

## Activation functions and derivatives

$$
\sigma(z) = \frac{1}{1 + e^{-z}}, \qquad \sigma'(z) = \sigma(z)\,(1-\sigma(z)),
$$

$$
\tanh(z) = \frac{e^{z} - e^{-z}}{e^{z} + e^{-z}}, \qquad \tanh'(z) = 1 - \tanh(z)^2,
$$

$$
\operatorname{ReLU}(z) = \max(0, z), \qquad
\operatorname{ReLU}'(z) = \begin{cases} 1 & z > 0 \\ 0 & z \le 0 \end{cases},
$$

$$
\operatorname{softmax}(z)_i = \frac{e^{z_i}}{\sum_j e^{z_j}}, \qquad \sum_i \operatorname{softmax}(z)_i = 1.
$$

Sigmoid maps to $(0,1)$ (binary probability), tanh to $(-1,1)$ (zero-centred),
ReLU keeps positives and is cheap, softmax yields a distribution over classes.
Sigmoid and tanh saturate for large $|z|$ (derivatives near 0), which causes the
**vanishing gradient**; ReLU avoids saturation for $z > 0$.
Implemented in `sigmoid`, `relu`, `softmax`, `activationGradient`;
[Lab 11](labs/11-o-neuronio.md), [Lab 12](labs/12-funcoes-de-ativacao.md).

## Forward propagation, backpropagation and the chain rule

A dense layer transforms its input, and the network composes layers:

$$
\mathbf{a}^{(l)} = f^{(l)}\!\left(W^{(l)}\mathbf{a}^{(l-1)} + \mathbf{b}^{(l)}\right),
\qquad
\hat{y} = f^{(L)}\!\left(\cdots f^{(1)}(\mathbf{x})\right).
$$

The chain rule gives the backpropagated error (delta) for each layer from the
output backwards, where $\odot$ is the element-wise product:

$$
\delta^{(l)} = \left(W^{(l+1)T}\delta^{(l+1)}\right) \odot f^{(l)\prime}\!\left(\mathbf{z}^{(l)}\right).
$$

For sigmoid/softmax with cross-entropy the output delta simplifies to
$\delta^{(L)} = \hat{y} - y$, and the weight gradients are
$\partial J / \partial W^{(l)} = \delta^{(l)}(\mathbf{a}^{(l-1)})^{T}$.

The training loop repeats: forward → loss → backprop → update
$\theta \leftarrow \theta - \eta\nabla_\theta J$. Implemented in
`forwardNetwork` and `updateWeights`; [Lab 13](labs/13-redes-neurais.md).

Losses used:

$$
\text{binary CE} = -\left[y\log p + (1-y)\log(1-p)\right],
\qquad
\text{categorical CE} = -\log p_{y}.
$$

## Classification, decision boundaries and XOR

Classification predicts a class; the decision boundary is where the model is
indifferent:

$$
\{x : p(y=1 \mid x) = 0.5\} \quad\Longleftrightarrow\quad z = 0,
\qquad
\hat{y} = \arg\max_k p_k.
$$

A **confusion matrix** $C$ has actual classes as rows and predicted classes as
columns; the diagonal $C_{kk}$ counts correct predictions. A linear model scores
$\approx 50\%$ on XOR, because XOR is not linearly separable:

$$
y = x_1 \oplus x_2 \quad (\text{classes on opposite corners}).
$$

A hidden layer with at least two neurons composes two "folds" and solves it.
Multiclass outputs use softmax with one-hot labels
($y = 1 \Rightarrow [0,1,0]$). Implemented in `confusionMatrix`,
`decisionBoundaryMesh`; [Lab 13](labs/13-redes-neurais.md),
[Lab 14](labs/14-classificacao-e-fronteiras-de-decisao.md).

## Images as tensors

A colour image is a rank-3 tensor of height × width × channels:

$$
I \in \mathbb{R}^{H \times W \times C}, \quad C = 3 \text{ (RGB) or } 1 \text{ (grayscale)}.
$$

Grayscale converts RGB to luminance (ITU-R BT.601 coefficients):

$$
Y = 0.299\,R + 0.587\,G + 0.114\,B.
$$

Normalisation rescales pixels to a small, centred range:

$$
x_{\text{unit}} = \frac{x}{255} \in [0, 1],
\qquad
x_{\text{signed}} = \left(\frac{x}{255} - 0.5\right)\cdot 2 \in [-1, 1].
$$

The $[-1, 1]$ range is the MobileNet input convention. Resizing
(`tf.image.resizeBilinear`) interpolates to a fixed $224 \times 224$ input,
which also reduces cost. Implemented in `toGrayscale`, `normalizeImage`,
`resizeImage`; [Lab 15](labs/15-imagens-como-tensores.md).

## Memory

Every live tensor occupies memory (GPU or CPU), so the number of live tensors
and their bytes grow with every allocation. For `float32`, each element uses 4
bytes, so a tensor of size $s$ reserves roughly $4s$ bytes:

$$
\text{bytes} \approx s \times \text{bytesPerElement}.
$$

`tf.memory()` exposes `numTensors` (live tensors), `numBytes` (reserved) and
`unreliable`. A **leak** is a tensor created but never disposed, so memory
grows monotonically (a loop without `dispose`/`tidy`). `tf.tidy(fn)` disposes
every tensor created in `fn` except the returned one, keeping memory flat;
`tensor.dispose()` frees a single long-lived tensor. Implemented by
`TfjsMemoryService`; [Lab 16](labs/16-gerenciamento-de-memoria.md).
