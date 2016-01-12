#include <pebble.h>

//#define VALUE_1 0
//#define VALUE_2 1


static Window *s_main_window;
static TextLayer *s_time_layer;
static TextLayer *s_current_session_layer;
static TextLayer *s_upcoming_session_layer;

static GFont s_time_font;
static BitmapLayer *s_background_layer;
static GBitmap *s_background_bitmap;



enum SessionKey {
    VALUE_1 = 0x0,  // TUPLE_CSTRING
    VALUE_2 = 0x1,  // TUPLE_CSTRING
};


#define PERSIST_VALUE_1 98
#define PERSIST_VALUE_2 99


static AppSync sync;
static uint8_t sync_buffer[256];


static void sync_error_callback(DictionaryResult dict_error, AppMessageResult app_message_error, void *context) {
    APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Sync Error: %d", app_message_error);
}

static void sync_tuple_changed_callback(const uint32_t key, const Tuple* new_tuple, const Tuple* old_tuple, void* context) {
    
    
    APP_LOG(APP_LOG_LEVEL_DEBUG, "key: %lu", key);
    
    switch (key) {
               case VALUE_1:
            APP_LOG(APP_LOG_LEVEL_DEBUG, "s_current_session_layer: %s", new_tuple->value->cstring);
            
            persist_write_string(PERSIST_VALUE_1, new_tuple->value->cstring);
            
            text_layer_set_text(s_current_session_layer, new_tuple->value->cstring);
            break;
            
        case VALUE_2:
            // App Sync keeps new_tuple in sync_buffer, so we may use it directly
            
            APP_LOG(APP_LOG_LEVEL_DEBUG, "s_upcoming_session_layer: %s", new_tuple->value->cstring);
            
            persist_write_string(PERSIST_VALUE_2, new_tuple->value->cstring);

            text_layer_set_text(s_upcoming_session_layer, new_tuple->value->cstring);

            
            break;

    }
    
    
}

static void main_window_load(Window *window) {
    
    
    // Create GBitmap, then set to created BitmapLayer
    s_background_bitmap = gbitmap_create_with_resource(RESOURCE_ID_IMAGE_BACKGROUND);
    s_background_layer = bitmap_layer_create(GRect(0, 0, 144, 168));
    //bitmap_layer_set_bitmap(s_background_layer, s_background_bitmap);
    
    bitmap_layer_set_background_color(s_background_layer,GColorBlack);
    
    layer_add_child(window_get_root_layer(window), bitmap_layer_get_layer(s_background_layer));
    
    Layer *window_layer = window_get_root_layer(window);
    GRect window_bounds = layer_get_bounds(window_layer);
    
    
    s_current_session_layer = text_layer_create(GRect(5, 0, 144, 40));
    
    // Create time TextLayer
    //  s_time_layer = text_layer_create(GRect(0, 55, 144, 50));
    s_time_layer = text_layer_create(GRect(5, 52, 139, 50));
    
    
    s_upcoming_session_layer = text_layer_create(GRect(5, 130, 144, 40));
    
    text_layer_set_background_color(s_time_layer, GColorClear);
    text_layer_set_text_color(s_time_layer, GColorWhite);
    
    // Create GFont
    s_time_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_PERFECT_DOS_48));
    
    // Apply to TextLayer
    text_layer_set_font(s_time_layer, s_time_font);
    
    
    // Improve the layout to be more like a watchface
    // text_layer_set_font(s_time_layer, fonts_get_system_font(FONT_KEY_BITHAM_42_BOLD));
    text_layer_set_text_alignment(s_time_layer, GTextAlignmentCenter);
    
    
    
    
    text_layer_set_font(s_current_session_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24));
    text_layer_set_overflow_mode(s_current_session_layer, GTextOverflowModeTrailingEllipsis);
    text_layer_set_text_color(s_current_session_layer, GColorWhite);
    text_layer_set_background_color(s_current_session_layer, GColorClear);
    
    layer_add_child(window_layer, text_layer_get_layer(s_current_session_layer));
    
    
    
    text_layer_set_font(s_upcoming_session_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24));
    text_layer_set_text_color(s_upcoming_session_layer, GColorWhite);
    text_layer_set_overflow_mode(s_upcoming_session_layer, GTextOverflowModeTrailingEllipsis);
    text_layer_set_background_color(s_upcoming_session_layer, GColorClear);
    
    layer_add_child(window_layer, text_layer_get_layer(s_upcoming_session_layer));
    
    
    
    char *currentSession = "                                                     ";
    char *nextSession = "                                                     ";
  
    if (persist_exists(PERSIST_VALUE_1)) {
        persist_read_string(PERSIST_VALUE_1, currentSession, 30);
    }
    
    if (persist_exists(PERSIST_VALUE_2)) {
        persist_read_string(PERSIST_VALUE_2, nextSession,30);
    }
    
    Tuplet initial_values[] = {
        TupletCString(VALUE_1, currentSession),
        TupletCString(VALUE_2, nextSession),
    };
    
    app_sync_init(&sync, sync_buffer, sizeof(sync_buffer), initial_values, ARRAY_LENGTH(initial_values),
                  sync_tuple_changed_callback, sync_error_callback, NULL);
    
    
    
    
    // Add it as a child layer to the Window's root layer
    layer_add_child(window_get_root_layer(window), text_layer_get_layer(s_time_layer));
}





static void main_window_unload(Window *window) {
    
    app_sync_deinit(&sync);
    
    
    // Unload GFont
    fonts_unload_custom_font(s_time_font);
    // Destroy TextLayer
    text_layer_destroy(s_time_layer);
    text_layer_destroy(s_current_session_layer);
    text_layer_destroy(s_upcoming_session_layer);
    
    // Destroy GBitmap
    gbitmap_destroy(s_background_bitmap);
    
    // Destroy BitmapLayer
    bitmap_layer_destroy(s_background_layer);
    
}

static void update_time() {
    // Get a tm structure
    time_t temp = time(NULL);
    struct tm *tick_time = localtime(&temp);
    
    // Create a long-lived buffer
    static char buffer[] = "00:00";
    
    // Write the current hours and minutes into the buffer
    if(clock_is_24h_style() == true) {
        // Use 24 hour format
        strftime(buffer, sizeof("00:00"), "%H:%M", tick_time);
    } else {
        // Use 12 hour format
        strftime(buffer, sizeof("00:00"), "%I:%M", tick_time);
    }
    
    // Display this time on the TextLayer
    text_layer_set_text(s_time_layer, buffer);
}

//static void appmsg_in_dropped(AppMessageResult reason, void *context) {
//    APP_LOG(APP_LOG_LEVEL_DEBUG, "In dropped: %i", reason);
//}


void send_int(uint8_t key, uint8_t cmd)
{
    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);
    
    Tuplet value = TupletInteger(key, cmd);
    dict_write_tuplet(iter, &value);
    
    app_message_outbox_send();
}


static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
    
    //Every five minutes
    if(tick_time->tm_min % 10 == 0)
    {
        //Send an arbitrary message, the response will be handled by in_received_handler()
        send_int(5, 5);
    }
    
    update_time();
}

static void init() {
    // Create main Window element and assign to pointer
    s_main_window = window_create();
    
    
    
//    app_message_register_inbox_dropped(appmsg_in_dropped);
//    app_message_register_inbox_received(inbox_received_callback);
    
    app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
    APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message set up.");
    
    // Set handlers to manage the elements inside the Window
    window_set_window_handlers(s_main_window, (WindowHandlers) {
        .load = main_window_load,
        .unload = main_window_unload
    });
    
    // Show the Window on the watch, with animated=true
    window_stack_push(s_main_window, true);
    
    // Register with TickTimerService
    tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
    
    // Make sure the time is displayed from the start
    update_time();
    
    

//    if (persist_exists(PERSIST_VALUE_1)) {
//        
//        char sessionValue[128];
//        persist_read_string(PERSIST_VALUE_1, sessionValue, 128);
//        text_layer_set_text(s_current_session_layer, sessionValue);
//    }
//    
//    if (persist_exists(PERSIST_VALUE_2)) {
//        char sessionValue2[128];
//        persist_read_string(PERSIST_VALUE_2, sessionValue2,128);
//        text_layer_set_text(s_upcoming_session_layer, sessionValue2);
//    }
//
//    
    
}

static void deinit() {
    
    //persist_write_string(PERSIST_VALUE_1, text_layer_get_text(s_current_session_layer));
    //persist_write_string(PERSIST_VALUE_2, text_layer_get_text(s_upcoming_session_layer));
    
    tick_timer_service_unsubscribe();
    //Destroy Window
    window_destroy(s_main_window);
}

int main(void) {
    init();
    app_event_loop();
    deinit();
}
