import {
  Dict,
  Opaque
} from '@glimmer/util';

import {
  PathReference,
  Reference,
  VOLATILE_TAG,
  TagWrapper
} from "@glimmer/reference";

import {
  Arguments,
  CapturedArguments,
  Helper as GlimmerHelper,
  VM
} from "@glimmer/runtime";

export type UserHelper = (args: ReadonlyArray<Opaque>, named: Dict<Opaque>) => any;

export default function buildUserHelper(helperFunc: any): GlimmerHelper {
  return (_vm: VM, args: Arguments) => new HelperReference(helperFunc, args);
}

export class SimplePathReference<T> implements PathReference<T> {
  private parent: Reference<T>;
  private property: string;
  public tag: TagWrapper<null> = VOLATILE_TAG;

  constructor(parent: Reference<T>, property: string) {
    this.parent = parent;
    this.property = property;
  }

  value(): T {
    return (<any>this.parent.value())[this.property];
  }

  get(prop: string): PathReference<Opaque> {
    return new SimplePathReference(this, prop);
  }
}

export class HelperReference implements PathReference<Opaque> {
  private helper: UserHelper;
  private args: CapturedArguments;
  public tag: TagWrapper<null> = VOLATILE_TAG;

  constructor(helper: UserHelper, args: Arguments) {
    this.helper = helper;
    this.args = args.capture();
  }

  value() {
    let { helper, args } = this;

    return helper(args.positional.value(), args.named.value());
  }

  get(prop: string): SimplePathReference<Opaque> {
    return new SimplePathReference(this, prop);
  }
}
