---
title: AI systems and the ladder of abstraction
date: 2025-06-01T12:00:00.000-04:00
description: In this post, I discuss perspectives on building AI-enabled systems through the framing of abstraction.
---

When we design and build systems, a foundational conceptual tool is abstraction.
Considering a _functional system_, one which takes in inputs and produces
outputs, abstraction at the highest level is that of the complete black box. In
a black box system, the details of _how_ the system produces its output -- its
internal mechanisms -- are hidden from us. For a user, this simplified view can
be useful. For someone who wants to build such a system, the black box is useless.
Necessarily, implementation must descend the ladder of abstraction.

In the descent, the initial obscuration of our system is broken into smaller
units, called _components_. These components are systems in their own right,
accepting inputs and producing outputs. By breaking our overall system into
components, we describe _how_ inputs are transformed into outputs: initial
inputs flow through the logical components of the system until the final
outputs are produced. Like the larger system, these components can be broken
down further into smaller components, which can be refined into even smaller
components, and so on. When building systems, we seek a level of abstraction
that is _implementable_, where the tools at our disposal can build the 
individual components that comprise the system.

Traditional programming operates comfortably in this paradigm. High-level
languages allow natural implementation of higher level components. Performance
considerations or other factors may warrant the components breaking down further
to a level implementable by lower-level languages. Libraries operate at a higher
level of abstraction than languages themselves, implementing common components
and allowing system builders to remain higher up the ladder of abstraction.

Describing this process of climbing up and down the ladder of abstraction belies
many practical challenges. The refinement of some components into smaller 
pieces results in an intractable explosion of complexity. For example, suppose
one component of a system performs translation from English into French.
Mechanistically describing _how_ one translates English into French is
intractable if one considers implementation in a traditional programming
language.

The fundamental advance of machine learning is the ability to avoid this
explosion of complexity by raising the level of abstraction at which certain
components are implementable. With sufficient demonstrations of outputs
corresponding to particular inputs, a component can be implemented without
consideration of any finer sub-components. This expands the space of
practically implementable components and the types of systems that can be built
with them. Prior to techniques now commonly referred to as artificial
intelligence -- large language models and related approaches -- the latent
complexity of components that we could effectively approximate with machine
learning was limited by the amount of demonstrations we could provide for
training and the compute required to adapt the model to the given
demonstrations.

Learning functional components from data is powerful, but from a systems
building perspective it requires care. The subset of components that can
realistically be learned requires the input and output spaces to be constrained
in such a manner that available demonstrations provide an acceptable
representation of the underlying mechanisms. In overly simple terms this tends
to mean that your future expected inputs and desired outputs should look _like_
ones you have seen before. A system that regularly experiences novelty, say
from user behavior, can quickly break down if machine learning approaches are
applied inappropriately. Another important consideration in incorporating
machine learned components into systems is that these approaches produce
approximations. This is a general fact. While it's possible for a machine
learned system to model a deterministic process, it is the exception not the
rule. We trade the ability to build new kinds of components for the price of
introducing uncertainty into the system.[^1]

Empirical analysis is a key approach to managing the uncertainty that exists
within systems that incorporate machine learning. These systems must be tested.
Such empirical testing is built into the development and training of
traditional machine learning models. Consider an email spam detection system. A
standard approach to this classification problem will provide examples to train
the model and, typically, hold out a portion of data unseen during training to
provide an unbiased measure of the model's performance. If this process reports
a 90% accuracy at classifying spam emails, an engineer incorporating the model
into a system component can then engineer around that uncertainty (by, say,
putting all the spam emails in a separate folder that you occasionally check to
see if something important has been misclassified). Responsible system building
does not stop at initial testing. Since models are trained to perform well on
the data they were trained on, performance may degrade if the inputs into the
components shift over time. This phenomenon - known as _distribution shift_ -
necessitates continuous testing and quality evaluation of machine learned
components in the system. Only by regularly considering inputs to the system
and validating the output can confidence in performance be maintained.






[^1]: Most sufficiently complex systems contain uncertainty about their
    behavior, but the uncertainty contained within machine learned components
is different. In a complex system, the uncertainty is an expression of lack of
total knowledge on how all the components function together and whether the
implemented system behaves as it is designed to. When faced with unexpected or
erroneous behavior in a traditional complex system, one can carefully step
through the mechanistic implementation and answer _why_ the system behaved as
it did. The uncertainty of a machine learned component resists a
straightforward answer to why. Whole subfields of research dedicate themselves
to explaining and interpreting the behavior of machine learning models.
Challenging those efforts, the sophistication and complexity of modern machine
learning models has mostly outpaced the work to interpret them.
