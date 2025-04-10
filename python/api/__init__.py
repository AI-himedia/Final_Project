from .test import test_router
from .chat_tone_analysis import sms_init_router
from .response_generator import sms_router

routers = [test_router, sms_init_router, sms_router]