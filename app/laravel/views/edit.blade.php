@extends('layouts.%RoutePrefix%.main')

@section('title')
 - %RoutePrefix% edit %Table%
@endsection('title')

@section('head')
@stop

@section('links')
| <a href="{{ route('admin_%Table%_index')}}">&lt;&lt; Back to %Table% </a>
@stop

@section('content')

<div class="container">
    <div class="row">        
        <div class="col-md-8 col-md-offset-2">
            <div class="panel panel-default">                                
            
                <div class="panel-heading">                    
                    <h4>Edit %TableSingular%</h4><hr>
                </div>
                <div class="panel-body">                   					
                    <form class="form-horizontal" role="form" method="POST" action="{{ route('%RoutePrefix%_%Table%_update', ['%TableSingular%' => $%TableSingular%]) }}">
                        {{ csrf_field() }}
						
                        %Inputs%
                       
                        <div class="form-group">
                            <div class="col-md-8 col-md-offset-4">
                                <button type="submit" class="btn btn-primary">
                                    Update
                                </button>
								<a class="btn btn-primary" href="#" onclick="window.history.back()"> 
									Cancel
								</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

</div>
@stop