from django.core.checks import messages
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework import generics, serializers, status
from rest_framework.response import Response
 
from .models import Room
from .serializer import RoomSerializer, RoomCreateSerializer, RoomUpdateSerializer


class RoomListView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class RoomCreateView(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):  
            self.request.session.create()

        data = request.data
        serializer = RoomCreateSerializer(data=data)
        if serializer.is_valid():
            guest_can_pause = serializer._validated_data['guest_can_pause']
            votes_to_skip = serializer._validated_data['votes_to_skip']
            host = self.request.session.session_key

            rooms = Room.objects.filter(host=host)
            if rooms.exists():
                print('host exists', host)
                serializer = rooms[0]
                serializer.guest_can_pause = guest_can_pause
                serializer.votes_to_skip = votes_to_skip            
            else:
                print('new host', host)
                serializer = Room(**data)
                serializer.host = host

            serializer.save()
            self.request.session['room_code'] = serializer.code
            return Response(RoomSerializer(serializer).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        

class RoomDetailView(APIView):
    serializer = RoomSerializer

    def get(self, request, format=None, **kwargs):
        code = request.GET.get('code')
        print(code)
        if code != None:
            try:
                room = Room.objects.get(code=code)
                data = self.serializer(room).data
                data['is_host'] = self.request.session.session_key == data['host']
                return Response(data, status=status.HTTP_200_OK)
            except:
                return Response({'Room Not Found':'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND) 
        return Response({'Bad Request':'Code paramater not found in request'}, status=status.HTTP_400_BAD_REQUEST)        
            
class RoomJoinView(APIView):
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):  
            self.request.session.create()

        code = request.data.get('code')
        print('code: ', code)
        if code != None:
            try:
                room = Room.objects.get(code=code)
                self.request.session['room_code'] = code
                return Response({'message':'Room Joined'}, status=status.HTTP_200_OK)
            except:
                return Response({'Room Not Found':'Invalid Room Code'}, status=status.HTTP_404_NOT_FOUND) 
        return Response({'Bad Request':'No Code Entered'}, status=status.HTTP_400_BAD_REQUEST)        

class UserInRoomView(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):  
            self.request.session.create()

        data = {
            'code':self.request.session.get('room_code')
        }
        print(data)
        return JsonResponse(data, status=status.HTTP_200_OK)

class LeaveRoomView(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            
            host = self.request.session.session_key
            rooms = Room.objects.filter(host=host)
            if rooms.exists():
                room= rooms[0]
                room.delete()
        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)

class UpdateRoomView(APIView):

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):  
            self.request.session.create()

        serializer = RoomUpdateSerializer(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer._validated_data['guest_can_pause']
            votes_to_skip = serializer._validated_data['votes_to_skip']
            code = serializer._validated_data['code']

            try:
                room = Room.objects.get(code=code)
                user = self.request.session.session_key

                if room.host != user:
                    return Response({'message':'You Are Not The Host Of The Room'}, status=status.HTTP_403_FORBIDDEN)
                
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save()
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            except:
                return Response({'Room Not Found':'Room Doesn\'t exist'}, status=status.HTTP_404_NOT_FOUND) 
 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)        
