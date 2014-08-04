/*
GPII Node.js GSettings Bridge

Copyright 2012 Steven Githens

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

#include <node.h>
#include <v8.h>

#include <gio/gio.h>

using namespace v8;

Handle<Value> get_gsetting_keys(const Arguments& args) {
  HandleScope scope;
  GSettings *settings;
  char schema[1024];
  gchar ** keys;
  gint i;
  gint size = 0;
  args[0]->ToString()->WriteAscii(schema);
  settings = g_settings_new(schema);
  keys = g_settings_list_keys(settings);
  for (i = 0; keys[i]; i++) {
    size++; // Figure out how to do this in 1 loop
  }
  Handle<Array> togo;
  togo = Array::New(size);
  for (i = 0; keys[i]; i++) {
    togo->Set(i,String::New(keys[i]));
  }
  return scope.Close(togo);
}

/* Should take schema and key */
Handle<Value> get_gsetting(const Arguments& args) {
  HandleScope scope;
  GSettings *settings;
  char schema[1024];
  char key[1024];
  args[0]->ToString()->WriteAscii(schema);
  settings = g_settings_new(schema);
  args[1]->ToString()->WriteAscii(key);
  GVariant* variant;
  const GVariantType* type;
  
  variant = g_settings_get_value(settings,key);
  type = g_variant_get_type(variant);

  if (g_variant_type_equal(type,G_VARIANT_TYPE_DOUBLE)) {
    return scope.Close(Number::New(g_variant_get_double(variant)));
  }
  else if (g_variant_type_equal(type,G_VARIANT_TYPE_INT32)) {
    return scope.Close(Int32::New(g_variant_get_int32(variant)));
  }
  else if (g_variant_type_equal(type,G_VARIANT_TYPE_STRING)) {
    return scope.Close(String::New(g_variant_get_string(variant,NULL)));
  }
  else if (g_variant_type_equal(type,G_VARIANT_TYPE_BOOLEAN)) {
    return scope.Close(Boolean::New(g_variant_get_boolean(variant)));
  }
  else {
    g_print("The type is %s\n", g_variant_type_peek_string(type));
    ThrowException(Exception::Error(String::New("Need to implement reading that value type")));
    return scope.Close(Undefined());
  }
}

/* Should take schema, key, and value */
Handle<Value> set_gsetting(const Arguments& args) {
  HandleScope scope;
  GSettings *settings;
  GVariant* variant;
  const GVariantType* type;
  char schema[1024];
  char key[1024];
  bool status = false;

  args[0]->ToString()->WriteAscii(schema);
  settings = g_settings_new(schema);
  args[1]->ToString()->WriteAscii(key);
  if (args[2]->IsBoolean()) { 
    status = g_settings_set_boolean(settings,key,args[2]->BooleanValue());
  }
  else if (args[2]->IsNumber()) {
    variant = g_settings_get_value(settings,key);
    type = g_variant_get_type(variant);
    if (g_variant_type_equal(type,G_VARIANT_TYPE_DOUBLE)) {
      status = g_settings_set_double(settings,key,args[2]->ToNumber()->Value());
    }
    else if (g_variant_type_equal(type,G_VARIANT_TYPE_INT32)) {
      status = g_settings_set_int(settings,key,args[2]->ToInt32()->Value());
    }
    else {
      g_print("The type is %s\n", g_variant_type_peek_string(type));
      ThrowException(Exception::Error(String::New("We haven't implemented this number type yet!")));
    }
  }
  else if (args[2]->IsString()) {
    char val[1024];
    variant = g_settings_get_value(settings,key);
    type = g_variant_get_type(variant);
    args[2]->ToString()->WriteAscii(val);
    status = g_settings_set_string(settings,key,val);
  }
  else {
    ThrowException(Exception::Error(String::New("We haven't implemented this type yet!")));
  }
  g_settings_sync();
  return scope.Close(Boolean::New(status));
}

void init(Handle<Object> target) {
  target->Set(String::NewSymbol("set_gsetting"),
              FunctionTemplate::New(set_gsetting)->GetFunction());
  target->Set(String::NewSymbol("get_gsetting"),
              FunctionTemplate::New(get_gsetting)->GetFunction());
  target->Set(String::NewSymbol("get_gsetting_keys"),
              FunctionTemplate::New(get_gsetting_keys)->GetFunction());
}
NODE_MODULE(nodegsettings, init)

